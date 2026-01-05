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

    const workflows =
      await this.workflowRepository.findByUserAndStatusWithPagination(
        userId,
        status,
        limit,
        offset,
      );

    const total = await this.workflowRepository.countByUserAndStatus(
      userId,
      status,
    );

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
    const workflow = await this.workflowRepository.findById(id);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.userId !== userId)
      throw new Error('Forbidden: You do not own this workflow');
    const updated = await this.workflowRepository.updateStatus(id, status);
    return updated;
  }

  async updateSnooze(
    userId: string,
    id: string,
    snoozedUntil: Date,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.workflowRepository.findById(id);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.userId !== userId)
      throw new Error('Forbidden: You do not own this workflow');
    const updated = await this.workflowRepository.updateSnooze(
      id,
      snoozedUntil,
    );
    return updated;
  }

  async findByEmailId(
    userId: string,
    emailId: string,
  ): Promise<EmailWorkflowEntity | null> {
    return this.workflowRepository.findByGmailMessageId(userId, emailId);
  }

  async createOrUpdateWorkflow(
    userId: string,
    emailData: {
      emailId: string;
      subject: string;
      from: string;
      date: Date;
      snippet?: string;
    },
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity> {
    const existing = await this.workflowRepository.findByGmailMessageId(
      userId,
      emailData.emailId,
    );

    if (existing) {
      return this.workflowRepository.updateStatus(existing.id, status);
    }

    return this.workflowRepository.create({
      userId,
      gmailMessageId: emailData.emailId,
      subject: emailData.subject,
      from: emailData.from,
      date: emailData.date,
      snippet: emailData.snippet,
      status,
    });
  }

  async updatePriority(
    userId: string,
    id: string,
    priority: number,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.workflowRepository.findById(id);
    if (!workflow) throw new Error('Workflow not found');
    if (workflow.userId !== userId)
      throw new Error('Forbidden: You do not own this workflow');
    return this.workflowRepository.updatePriority(id, priority);
  }
}
