import { WorkflowStatus } from '@prisma/client';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../../domain/entities/emaiWorkflow.entity';
import { InboxWorkflowService } from '../../../infrastructure/services/inbox-workflow.service';
import { EmbeddingQueueService } from '../../../infrastructure/services/embedding-queue.service';
import { Optional } from '@nestjs/common';

export interface GetWorkflowsInput {
  userId: string;
  status: WorkflowStatus;
  limit: number;
  offset: number;
  sortBy?: 'date_newest' | 'date_oldest';
  unreadOnly?: boolean;
  attachmentsOnly?: boolean;
}

export interface GetWorkflowsOutput {
  data: EmailWorkflowEntity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  sort?: {
    sortBy?: 'date_newest' | 'date_oldest';
  };
  filters?: {
    unreadOnly?: boolean;
    attachmentsOnly?: boolean;
  };
}

export class GetWorkflowsUseCase {
  constructor(
    private readonly workflowRepository: IEmailWorkflowRepository,
    private readonly inboxWorkflowService: InboxWorkflowService,
    @Optional() private readonly embeddingQueueService?: EmbeddingQueueService,
  ) {}

  async execute(input: GetWorkflowsInput): Promise<GetWorkflowsOutput> {
    const { userId, status, limit, offset, sortBy, unreadOnly, attachmentsOnly } = input;

    const filterOptions = {
      sortBy,
      unreadOnly,
      attachmentsOnly,
    };

    if (status === WorkflowStatus.INBOX) {
      const syncLimit = Math.max(limit + offset, 20);
      this.inboxWorkflowService.syncInboxEmails(userId, syncLimit).catch((err) => {
        console.error('Failed to sync inbox emails:', err);
      });
    }

    const workflows =
      await this.workflowRepository.findByUserAndStatusWithPagination(
        userId,
        status,
        limit,
        offset,
        filterOptions,
      );

    const total = await this.workflowRepository.countByUserAndStatus(
      userId,
      status,
      {
        unreadOnly,
        attachmentsOnly,
      },
    );

    if (this.embeddingQueueService) {
      this.embeddingQueueService
        .queuePendingEmbeddings(userId, workflows)
        .catch((err) => {
          console.error('Failed to queue embedding jobs:', err);
        });
    }

    const response: GetWorkflowsOutput = {
      data: workflows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    // Only include sort if provided
    if (sortBy) {
      response.sort = { sortBy };
    }

    // Only include filters if at least one is provided
    if (unreadOnly !== undefined || attachmentsOnly !== undefined) {
      response.filters = {};
      if (unreadOnly !== undefined) {
        response.filters.unreadOnly = unreadOnly;
      }
      if (attachmentsOnly !== undefined) {
        response.filters.attachmentsOnly = attachmentsOnly;
      }
    }

    return response;
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
