import { WorkflowStatus } from '@prisma/client';

export class EmailWorkflowEntity {
  id: string;
  userId: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: Date;
  snippet?: string;
  status: WorkflowStatus;
  priority: number;
  deadline?: Date;
  snoozedUntil?: Date;
  aiSummary?: string;
  urgencyScore?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EmailWorkflowEntity>) {
    Object.assign(this, partial);
  }

  canSnooze(): boolean {
    return this.status !== WorkflowStatus.DONE;
  }

  shouldWakeUp(now: Date = new Date()): boolean {
    return (
      this.status === WorkflowStatus.SNOOZED &&
      this.snoozedUntil !== null &&
      this.snoozedUntil !== undefined && // Fix: check undefined
      this.snoozedUntil <= now
    );
  }

  isOverdue(): boolean {
    if (!this.deadline) return false;
    return this.deadline < new Date() && this.status !== WorkflowStatus.DONE;
  }

  isHighUrgency(): boolean {
    return (this.urgencyScore ?? 0) >= 0.7;
  }
}