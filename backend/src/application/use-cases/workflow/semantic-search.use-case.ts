import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../../domain/entities/emaiWorkflow.entity';
import type { IEmbeddingPort } from '../../ports/embedding.port';

export interface SemanticSearchInput {
  userId: string;
  query: string;
  limit: number;
  offset: number;
}

export interface SemanticSearchResult {
  id: string;
  userId: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: Date;
  snippet?: string;
  hasAttachment: boolean;
  status: any;
  priority: number;
  deadline?: Date;
  snoozedUntil?: Date;
  aiSummary?: string;
  urgencyScore?: number;
  embedding?: number[];
  embeddingStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  similarity?: number; 
}

export interface SemanticSearchOutput {
  data: SemanticSearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

@Injectable()
export class SemanticSearchUseCase {
  private readonly logger = new Logger(SemanticSearchUseCase.name);

  constructor(
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,
    @Optional()
    @Inject('IEmbeddingPort')
    private readonly embeddingService?: IEmbeddingPort,
  ) {}

  async execute(input: SemanticSearchInput): Promise<SemanticSearchOutput> {
    const { userId, query, limit, offset } = input;

    this.logger.log(`[SEMANTIC SEARCH] Starting search - User: ${userId}, Query: "${query}", Limit: ${limit}, Offset: ${offset}`);

    // Fallback to fuzzy search if embedding service is not available
    if (!this.embeddingService) {
      this.logger.warn('[SEMANTIC SEARCH] Embedding service not available, falling back to fuzzy search');
      const workflows = await this.workflowRepository.searchEmails(
        userId,
        query,
        limit,
        offset,
      );
      const total = await this.workflowRepository.countSearchResults(userId, query);

      this.logger.log(`[SEMANTIC SEARCH] Fuzzy search completed - Found ${workflows.length} results (total: ${total})`);

      return {
        data: workflows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }

    try {
      this.logger.log(`[SEMANTIC SEARCH] Generating embedding for query: "${query}"`);
      const startTime = Date.now();
      
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const embeddingTime = Date.now() - startTime;
      
      this.logger.log(`[SEMANTIC SEARCH] Embedding generated successfully (dimension: ${queryEmbedding.length}, time: ${embeddingTime}ms)`);

      // Perform semantic search with pagination
      this.logger.log(`[SEMANTIC SEARCH] Performing vector similarity search...`);
      const searchStartTime = Date.now();
      const { workflows, total } = await this.workflowRepository.semanticSearch(
        userId,
        queryEmbedding,
        limit,
        offset,
      );
      const searchTime = Date.now() - searchStartTime;

      // Map to include similarity scores
      const resultsWithSimilarity: SemanticSearchResult[] = workflows.map((w) => {
        const similarity = (w as any).similarity;
        return {
          id: w.id,
          userId: w.userId,
          gmailMessageId: w.gmailMessageId,
          subject: w.subject,
          from: w.from,
          date: w.date,
          snippet: w.snippet,
          hasAttachment: w.hasAttachment,
          status: w.status,
          priority: w.priority,
          deadline: w.deadline,
          snoozedUntil: w.snoozedUntil,
          aiSummary: w.aiSummary,
          urgencyScore: w.urgencyScore,
          embedding: w.embedding,
          embeddingStatus: w.embeddingStatus,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          similarity,
        };
      });

      this.logger.log(
        `[SEMANTIC SEARCH] ✅ Search completed successfully - ` +
        `Found ${resultsWithSimilarity.length} results (total: ${total}, ` +
        `search time: ${searchTime}ms, total time: ${Date.now() - startTime}ms)`
      );

      if (resultsWithSimilarity.length > 0) {
        const topResults = resultsWithSimilarity.slice(0, 3).map(w => {
          const similarity = w.similarity ? `(similarity: ${w.similarity.toFixed(3)})` : '';
          return `"${w.subject}" ${similarity}`;
        }).join(', ');
        this.logger.log(`[SEMANTIC SEARCH] Top results: ${topResults}`);
      }

      return {
        data: resultsWithSimilarity,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      this.logger.error(`[SEMANTIC SEARCH] ❌ Semantic search failed, falling back to fuzzy search:`, error);
      
      // Fallback to fuzzy search
      const workflows = await this.workflowRepository.searchEmails(
        userId,
        query,
        limit,
        offset,
      );
      const total = await this.workflowRepository.countSearchResults(userId, query);

      this.logger.log(`[SEMANTIC SEARCH] Fuzzy search fallback completed - Found ${workflows.length} results (total: ${total})`);

      return {
        data: workflows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }
  }
}
