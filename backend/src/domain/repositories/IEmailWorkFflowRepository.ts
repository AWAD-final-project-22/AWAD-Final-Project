import { EmailWorkflowEntity } from '../entities/emaiWorkflow.entity';
import { WorkflowStatus } from '@prisma/client';

export interface IEmailWorkflowRepository {
  create(workflow: Partial<EmailWorkflowEntity>): Promise<EmailWorkflowEntity>;
  findById(id: string): Promise<EmailWorkflowEntity | null>;
  findByGmailMessageId(
    userId: string,
    gmailMessageId: string,
  ): Promise<EmailWorkflowEntity | null>;
  findByUserAndStatus(
    userId: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity[]>;
  findByUserAndStatusWithPagination(
    userId: string,
    status: WorkflowStatus,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]>;
  countByUserAndStatus(userId: string, status: WorkflowStatus): Promise<number>;
  findSnoozedEmailsDue(now?: Date): Promise<EmailWorkflowEntity[]>;
  updateStatus(
    id: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity>;
  updateSnooze(id: string, snoozedUntil: Date): Promise<EmailWorkflowEntity>;
  updateAiSummary(
    id: string,
    summary: string,
    urgencyScore?: number,
  ): Promise<EmailWorkflowEntity>;
  syncFromGmail(userId: string, gmailEmails: any[]): Promise<void>;

  // New methods for full-text search
  searchEmails(
    userId: string,
    query: string,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]>;

  countSearchResults(userId: string, query: string): Promise<number>;

  updatePriority(id: string, priority: number): Promise<EmailWorkflowEntity>;

  updateEmbeddingStatus(id: string, status: string): Promise<EmailWorkflowEntity>;
  updateEmbedding(id: string, embedding: number[]): Promise<EmailWorkflowEntity>;
  findPendingEmbeddings(userId: string, limit: number): Promise<EmailWorkflowEntity[]>;
  semanticSearch(
    userId: string,
    queryEmbedding: number[],
    limit: number,
    offset?: number,
  ): Promise<{ workflows: EmailWorkflowEntity[]; total: number }>;
  batchUpdateEmbeddings(
    updates: Array<{ id: string; embedding: number[] | null; status: string }>,
  ): Promise<void>;
}
