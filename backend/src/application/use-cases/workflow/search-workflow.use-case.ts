import { Injectable, Logger } from '@nestjs/common';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../../domain/entities/emaiWorkflow.entity';

export interface SearchWorkflowsInput {
  userId: string;
  query: string;
  limit: number;
  offset: number;
}

export interface SearchWorkflowsOutput {
  data: EmailWorkflowEntity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

@Injectable()
export class SearchWorkflowsUseCase {
  private readonly logger = new Logger(SearchWorkflowsUseCase.name);

  constructor(
    private readonly workflowRepository: IEmailWorkflowRepository,
  ) {}

  async execute(input: SearchWorkflowsInput): Promise<SearchWorkflowsOutput> {
    const { userId, query, limit, offset } = input;
    
    this.logger.log(`[FUZZY SEARCH] Executing fuzzy search - User: ${userId}, Query: "${query}", Limit: ${limit}, Offset: ${offset}`);
    
    const startTime = Date.now();
    const workflows = await this.workflowRepository.searchEmails(
      userId, 
      query, 
      limit, 
      offset
    );
    const searchTime = Date.now() - startTime;
    
    const countStartTime = Date.now();
    const total = await this.workflowRepository.countSearchResults(userId, query);
    const countTime = Date.now() - countStartTime;
    
    this.logger.log(
      `[FUZZY SEARCH] ✅ Search completed - Found ${workflows.length} results (total: ${total}, ` +
      `search time: ${searchTime}ms, count time: ${countTime}ms)`
    );

    if (workflows.length > 0) {
      const topResults = workflows.slice(0, 3).map(w => {
        const relevance = (w as any).relevanceScore ? `(relevance: ${(w as any).relevanceScore.toFixed(3)})` : '';
        return `"${w.subject}" ${relevance}`;
      }).join(', ');
      this.logger.log(`[FUZZY SEARCH] Top results: ${topResults}`);
    }
    
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
