import { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class EmailWorkflowRepositoryImpl implements IEmailWorkflowRepository {
  private readonly logger = new Logger(EmailWorkflowRepositoryImpl.name);

  constructor(private prisma: PrismaService) {}

  private toEntity(workflow: any): EmailWorkflowEntity {
    return new EmailWorkflowEntity({
      ...workflow,
      snippet: workflow.snippet ?? undefined,
      deadline: workflow.deadline ?? undefined,
      snoozedUntil: workflow.snoozedUntil ?? undefined,
      aiSummary: workflow.aiSummary ?? undefined,
      urgencyScore: workflow.urgencyScore ?? undefined,
      embedding: workflow.embedding ? JSON.parse(JSON.stringify(workflow.embedding)) : undefined,
      embeddingStatus: workflow.embeddingStatus ?? undefined,
    });
  }

  async create(
    data: Partial<EmailWorkflowEntity>,
  ): Promise<EmailWorkflowEntity> {
    const existing = await this.findByGmailMessageId(
      data.userId!,
      data.gmailMessageId!,
    );
    if (existing) {
      return existing;
    }
    const workflow = await this.prisma.emailWorkflow.create({
      data: {
        userId: data.userId!,
        gmailMessageId: data.gmailMessageId!,
        subject: data.subject!,
        from: data.from!,
        date: data.date!,
        snippet: data.snippet,
        hasAttachment: data.hasAttachment || false,
        status: data.status || WorkflowStatus.INBOX,
        priority: data.priority || 0,
        deadline: data.deadline,
        snoozedUntil: data.snoozedUntil,
        aiSummary: data.aiSummary,
        urgencyScore: data.urgencyScore,
        embeddingStatus: data.embeddingStatus || 'PENDING',
      },
    });
    return this.toEntity(workflow);
  }

  async findById(id: string): Promise<EmailWorkflowEntity | null> {
    const workflow = await this.prisma.emailWorkflow.findUnique({
      where: { id },
    });
    return workflow ? this.toEntity(workflow) : null;
  }

  async findByGmailMessageId(
    userId: string,
    gmailMessageId: string,
  ): Promise<EmailWorkflowEntity | null> {
    const workflow = await this.prisma.emailWorkflow.findUnique({
      where: {
        userId_gmailMessageId: { userId, gmailMessageId },
      },
    });
    return workflow ? this.toEntity(workflow) : null;
  }

  async findByUserAndStatus(
    userId: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: { userId, status },
      orderBy: [
        { priority: 'desc' },
        { urgencyScore: 'desc' },
        { date: 'desc' },
      ],
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async findSnoozedEmailsDue(
    now: Date = new Date(),
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        status: WorkflowStatus.SNOOZED,
        snoozedUntil: {
          lte: now,
        },
      },
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async updateStatus(
    id: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        ...(status !== WorkflowStatus.SNOOZED && {
          snoozedUntil: null,
        }),
      },
    });
    return this.toEntity(workflow);
  }

  async updateSnooze(
    id: string,
    snoozedUntil: Date,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        status: WorkflowStatus.SNOOZED,
        snoozedUntil,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  async updateAiSummary(
    id: string,
    summary: string,
    urgencyScore?: number,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        aiSummary: summary,
        urgencyScore,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  async syncFromGmail(userId: string, gmailEmails: any[]): Promise<void> {
    const operations = gmailEmails.map((email) => {
      const gmailMessageId = email.id ? String(email.id) : undefined;
      if (!gmailMessageId) {
        throw new Error('gmailMessageId is missing for one of the emails');
      }
      return this.prisma.emailWorkflow.upsert({
        where: {
          userId_gmailMessageId: {
            userId,
            gmailMessageId,
          },
        },
        create: {
          userId,
          gmailMessageId,
          subject: email.subject || '(No Subject)',
          from: email.from || 'unknown@example.com',
          date: new Date(email.date),
          snippet: email.snippet,
          status: WorkflowStatus.INBOX,
          embeddingStatus: 'PENDING',
        },
        update: {
          subject: email.subject || '(No Subject)',
          snippet: email.snippet,
        },
      });
    });

    await this.prisma.$transaction(operations);
  }

  async updateDeadline(
    id: string,
    deadline: Date,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: { deadline },
    });
    return this.toEntity(workflow);
  }

  async findOverdueEmails(userId: string): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        userId,
        deadline: {
          lt: new Date(),
        },
        status: {
          not: WorkflowStatus.DONE,
        },
      },
      orderBy: { deadline: 'asc' },
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async findByUserAndStatusWithPagination(
    userId: string,
    status: WorkflowStatus,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: { userId, status },
      orderBy: [
        { priority: 'desc' },
        { urgencyScore: 'desc' },
        { date: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async countByUserAndStatus(
    userId: string,
    status: WorkflowStatus,
  ): Promise<number> {
    return this.prisma.emailWorkflow.count({
      where: { userId, status },
    });
  }

  async searchEmails(
    userId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]> {
    this.logger.log(`[FUZZY SEARCH] Searching for: "${query}" (userId: ${userId})`);

    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length === 0) {
      return [];
    }

    // Minimum similarity threshold for fuzzy matching (0.0 to 1.0)
    // Lower threshold = more typo tolerance, but may return less relevant results
    const SIMILARITY_THRESHOLD = 0.3;

    const startTime = Date.now();

    try {
      // Use PostgreSQL pg_trgm for fuzzy search with similarity scoring
      // This provides typo tolerance and partial matching
      const results = await this.prisma.$queryRaw<Array<{
        id: string;
        relevance_score: number;
        subject_match: number;
        from_match: number;
        snippet_match: number;
        summary_match: number;
      }>>`
        SELECT 
          id,
          GREATEST(
            COALESCE(similarity(subject, ${trimmedQuery}), 0) * 3.0,  -- Subject has highest weight (3x)
            COALESCE(similarity("from", ${trimmedQuery}), 0) * 2.5,   -- From has high weight (2.5x)
            COALESCE(similarity(COALESCE(snippet, ''), ${trimmedQuery}), 0) * 1.0,  -- Snippet has normal weight
            COALESCE(similarity(COALESCE("aiSummary", ''), ${trimmedQuery}), 0) * 1.5  -- Summary has medium weight (1.5x)
          ) as relevance_score,
          COALESCE(similarity(subject, ${trimmedQuery}), 0) as subject_match,
          COALESCE(similarity("from", ${trimmedQuery}), 0) as from_match,
          COALESCE(similarity(COALESCE(snippet, ''), ${trimmedQuery}), 0) as snippet_match,
          COALESCE(similarity(COALESCE("aiSummary", ''), ${trimmedQuery}), 0) as summary_match
        FROM email_workflows
        WHERE "userId" = ${userId}
          AND (
            -- Fuzzy match on subject
            similarity(subject, ${trimmedQuery}) > ${SIMILARITY_THRESHOLD}
            -- Fuzzy match on from (sender name or email)
            OR similarity("from", ${trimmedQuery}) > ${SIMILARITY_THRESHOLD}
            -- Fuzzy match on snippet (optional)
            OR (snippet IS NOT NULL AND similarity(snippet, ${trimmedQuery}) > ${SIMILARITY_THRESHOLD})
            -- Fuzzy match on AI summary (optional)
            OR ("aiSummary" IS NOT NULL AND similarity("aiSummary", ${trimmedQuery}) > ${SIMILARITY_THRESHOLD})
            -- Also support partial matches (contains) for better coverage
            OR LOWER(subject) LIKE LOWER(${'%' + trimmedQuery + '%'})
            OR LOWER("from") LIKE LOWER(${'%' + trimmedQuery + '%'})
            OR (snippet IS NOT NULL AND LOWER(snippet) LIKE LOWER(${'%' + trimmedQuery + '%'}))
            OR ("aiSummary" IS NOT NULL AND LOWER("aiSummary") LIKE LOWER(${'%' + trimmedQuery + '%'}))
          )
        ORDER BY 
          relevance_score DESC,
          priority DESC,
          "urgencyScore" DESC NULLS LAST,
          date DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const queryTime = Date.now() - startTime;
      this.logger.log(
        `[FUZZY SEARCH] Found ${results.length} results (query time: ${queryTime}ms)`
      );

      if (results.length === 0) {
        return [];
      }

      // Fetch full records by IDs
      const ids = results.map((r) => r.id);
      const workflows = await this.prisma.emailWorkflow.findMany({
        where: {
          id: { in: ids },
          userId,
        },
      });

      // Create map for quick lookup and preserve relevance order
      const workflowsMap = new Map(workflows.map((w) => [w.id, w]));
      const relevanceMap = new Map(results.map((r) => [r.id, r.relevance_score]));

      // Sort by relevance score from the query
      const sortedWorkflows = results
        .map((r) => {
          const workflow = workflowsMap.get(r.id);
          if (!workflow) return null;
          const entity = this.toEntity(workflow);
          // Attach relevance score for logging/debugging
          (entity as any).relevanceScore = r.relevance_score;
          return entity;
        })
        .filter((w): w is EmailWorkflowEntity => w !== null);

      // Log top results with relevance scores
      if (sortedWorkflows.length > 0) {
        const topScores = results.slice(0, 3).map(r => r.relevance_score.toFixed(3)).join(', ');
        this.logger.log(
          `[FUZZY SEARCH] Top relevance scores: [${topScores}]`
        );
      }

      return sortedWorkflows;
    } catch (error) {
      this.logger.error(`[FUZZY SEARCH] Error during fuzzy search:`, error);
      
      // Fallback to basic search if pg_trgm is not available
      this.logger.warn('[FUZZY SEARCH] Falling back to basic contains search');
      return this.basicSearchEmails(userId, trimmedQuery, limit, offset);
    }
  }

  /**
   * Fallback basic search using contains (case-insensitive)
   * Used when pg_trgm extension is not available
   */
  private async basicSearchEmails(
    userId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]> {
    const searchTerms = query
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return [];
    }

    const orConditions = searchTerms.flatMap((term) => [
      { subject: { contains: term, mode: 'insensitive' } },
      { from: { contains: term, mode: 'insensitive' } },
      { snippet: { contains: term, mode: 'insensitive' } },
      { aiSummary: { contains: term, mode: 'insensitive' } },
    ]);

    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        userId,
        OR: orConditions as any,
      },
      orderBy: [
        { priority: 'desc' },
        { urgencyScore: 'desc' },
        { date: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    return workflows.map((w) => this.toEntity(w));
  }

  async countSearchResults(userId: string, query: string): Promise<number> {
    this.logger.log(`[FUZZY SEARCH COUNT] Counting results for: "${query}"`);

    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length === 0) {
      return 0;
    }

    const SIMILARITY_THRESHOLD = 0.3;

    try {
      const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count
        FROM email_workflows
        WHERE "userId" = ${userId}
          AND (
            similarity(subject, ${trimmedQuery}) > ${SIMILARITY_THRESHOLD}
            OR similarity("from", ${trimmedQuery}) > ${SIMILARITY_THRESHOLD}
            OR (snippet IS NOT NULL AND similarity(snippet, ${trimmedQuery}) > ${SIMILARITY_THRESHOLD})
            OR ("aiSummary" IS NOT NULL AND similarity("aiSummary", ${trimmedQuery}) > ${SIMILARITY_THRESHOLD})
            OR LOWER(subject) LIKE LOWER(${'%' + trimmedQuery + '%'})
            OR LOWER("from") LIKE LOWER(${'%' + trimmedQuery + '%'})
            OR (snippet IS NOT NULL AND LOWER(snippet) LIKE LOWER(${'%' + trimmedQuery + '%'}))
            OR ("aiSummary" IS NOT NULL AND LOWER("aiSummary") LIKE LOWER(${'%' + trimmedQuery + '%'}))
          )
      `;

      const count = Number(result[0]?.count || 0);
      this.logger.log(`[FUZZY SEARCH COUNT] Found ${count} total results`);
      return count;
    } catch (error) {
      this.logger.error(`[FUZZY SEARCH COUNT] Error during count:`, error);
      
      // Fallback to basic count
      const searchTerms = trimmedQuery
        .split(/\s+/)
        .filter((term) => term.length > 0);

      if (searchTerms.length === 0) {
        return 0;
      }

      const orConditions = searchTerms.flatMap((term) => [
        { subject: { contains: term, mode: 'insensitive' } },
        { from: { contains: term, mode: 'insensitive' } },
        { snippet: { contains: term, mode: 'insensitive' } },
        { aiSummary: { contains: term, mode: 'insensitive' } },
      ]);

      const count = await this.prisma.emailWorkflow.count({
        where: {
          userId,
          OR: orConditions as any,
        },
      });

      return count;
    }
  }

  async updatePriority(
    id: string,
    priority: number,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        priority,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  // Embedding methods
  async updateEmbeddingStatus(
    id: string,
    status: string,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        embeddingStatus: status,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  async updateEmbedding(
    id: string,
    embedding: number[],
  ): Promise<EmailWorkflowEntity> {
    // Use raw SQL to update vector column
    await this.prisma.$executeRaw`
      UPDATE email_workflows 
      SET embedding = ${embedding}::vector, 
          "embeddingStatus" = 'COMPLETED',
          "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    const workflow = await this.prisma.emailWorkflow.findUnique({
      where: { id },
    });
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }
    return this.toEntity(workflow);
  }

  async findPendingEmbeddings(
    userId: string,
    limit: number,
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        userId,
        OR: [
          { embeddingStatus: 'PENDING' },
          { embeddingStatus: null },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async semanticSearch(
    userId: string,
    queryEmbedding: number[],
    limit: number,
    offset: number = 0,
  ): Promise<{ workflows: EmailWorkflowEntity[]; total: number }> {
    this.logger.log(
      `[SEMANTIC SEARCH] Executing vector similarity search - User: ${userId}, Limit: ${limit}, Offset: ${offset}, Embedding dimension: ${queryEmbedding.length}`
    );
    
    const startTime = Date.now();

    // First, get total count
    const totalResult = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM email_workflows
      WHERE "userId" = ${userId}
        AND embedding IS NOT NULL
        AND "embeddingStatus" = 'COMPLETED'
    `;
    const total = Number(totalResult[0]?.count || 0);

    this.logger.log(`[SEMANTIC SEARCH] Total available results: ${total}`);

    if (total === 0) {
      this.logger.warn(`[SEMANTIC SEARCH] No results found - No emails with completed embeddings for user ${userId}`);
      return { workflows: [], total: 0 };
    }

    // Use raw SQL for vector similarity search with pgvector
    // Select id and similarity score, then fetch full records
    const results = await this.prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
      SELECT 
        id,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM email_workflows
      WHERE "userId" = ${userId}
        AND embedding IS NOT NULL
        AND "embeddingStatus" = 'COMPLETED'
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const queryTime = Date.now() - startTime;

    this.logger.log(
      `[SEMANTIC SEARCH] Vector query completed - Found ${results.length} matching IDs ` +
      `(query time: ${queryTime}ms, similarity range: ${results.length > 0 ? 
        `${results[results.length - 1].similarity.toFixed(3)} - ${results[0].similarity.toFixed(3)}` : 'N/A'})`
    );

    if (results.length === 0) {
      return { workflows: [], total };
    }

    // Fetch full records by IDs using Prisma
    const ids = results.map((r) => r.id);
    this.logger.debug(`[SEMANTIC SEARCH] Fetching full records for ${ids.length} emails...`);
    
    const fetchStartTime = Date.now();
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
    const fetchTime = Date.now() - fetchStartTime;

    this.logger.log(`[SEMANTIC SEARCH] Fetched ${workflows.length} full records (fetch time: ${fetchTime}ms)`);

    // Sort by similarity order from raw query and attach similarity scores
    const workflowsMap = new Map(workflows.map((w) => [w.id, w]));
    const similarityMap = new Map(results.map((r) => [r.id, r.similarity]));
    
    const sortedWorkflows = results
      .map((r) => {
        const workflow = workflowsMap.get(r.id);
        if (!workflow) return null;
        const entity = this.toEntity(workflow);
        // Attach similarity score to entity (temporary, will be in response)
        (entity as any).similarity = r.similarity;
        return entity;
      })
      .filter((w): w is EmailWorkflowEntity => w !== null);

    if (sortedWorkflows.length !== results.length) {
      this.logger.warn(
        `[SEMANTIC SEARCH] Mismatch: Found ${results.length} IDs but only ${sortedWorkflows.length} workflows after fetch`
      );
    }

    // Log similarity scores
    if (sortedWorkflows.length > 0) {
      const scores = sortedWorkflows.map((w: any) => w.similarity?.toFixed(3) || 'N/A').join(', ');
      this.logger.log(
        `[SEMANTIC SEARCH] Similarity scores: [${scores}]`
      );
    }

    this.logger.log(
      `[SEMANTIC SEARCH] ✅ Semantic search completed - Returning ${sortedWorkflows.length} results ` +
      `(total: ${total}, total time: ${Date.now() - startTime}ms)`
    );

    return { workflows: sortedWorkflows, total };
  }

  async batchUpdateEmbeddings(
    updates: Array<{ id: string; embedding: number[] | null; status: string }>,
  ): Promise<void> {
    // Use transaction for batch update
    await this.prisma.$transaction(
      updates.map((update) => {
        if (update.embedding) {
          return this.prisma.$executeRaw`
            UPDATE email_workflows 
            SET embedding = ${update.embedding}::vector,
                "embeddingStatus" = ${update.status},
                "updatedAt" = NOW()
            WHERE id = ${update.id}
          `;
        } else {
          return this.prisma.emailWorkflow.update({
            where: { id: update.id },
            data: {
              embeddingStatus: update.status,
              updatedAt: new Date(),
            },
          });
        }
      }),
    );
  }
}
