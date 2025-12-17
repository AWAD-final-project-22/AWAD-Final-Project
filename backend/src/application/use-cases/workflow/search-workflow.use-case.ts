import { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
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

export class SearchWorkflowsUseCase {
  constructor(
    private readonly workflowRepository: IEmailWorkflowRepository,
  ) {}

  async execute(input: SearchWorkflowsInput): Promise<SearchWorkflowsOutput> {
    const { userId, query, limit, offset } = input;
    
    const workflows = await this.workflowRepository.searchEmails(
      userId, 
      query, 
      limit, 
      offset
    );
    
    const total = await this.workflowRepository.countSearchResults(userId, query);
    
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
