import { WorkflowStatus } from '@prisma/client';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../../domain/entities/emaiWorkflow.entity';
import { InboxWorkflowService } from '../../../infrastructure/services/inbox-workflow.service';

export interface GetWorkflowsInput {
  userId: string;
  status: WorkflowStatus;
  limit: number;
  offset: number;
}

export interface GetWorkflowsOutput {
  data: EmailWorkflowEntity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class GetWorkflowsUseCase {
  constructor(
    private readonly workflowRepository: IEmailWorkflowRepository,
    private readonly inboxWorkflowService: InboxWorkflowService,
  ) {}

  async execute(input: GetWorkflowsInput): Promise<GetWorkflowsOutput> {
    const { userId, status, limit, offset } = input;

    if (status === WorkflowStatus.INBOX) {
      const { data, total } = await this.inboxWorkflowService.getInboxWorkflows(
        userId,
        limit,
        offset,
      );

      return {
        data,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }

    const workflows = await this.workflowRepository.findByUserAndStatusWithPagination(
      userId,
      status,
      limit,
      offset,
    );

    const total = await this.workflowRepository.countByUserAndStatus(userId, status);

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

  async updateWorkflowStatus(
    userId: string,
    id: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity> {
    // Kiểm tra quyền sở hữu trước khi update
    const workflow = await this.workflowRepository.findById(id);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.userId !== userId) throw new Error('Forbidden: You do not own this workflow');
    const updated = await this.workflowRepository.updateStatus(id, status);
    return updated;
  }
}
