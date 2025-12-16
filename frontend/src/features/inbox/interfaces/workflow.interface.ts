export enum WorkflowStatus {
  INBOX = 'INBOX',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  SNOOZED = 'SNOOZED',
}

export interface IEmailWorkflow {
  id: string;
  userId: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: string;
  snippet?: string;
  status: WorkflowStatus;
  priority: number;
  deadline?: string;
  snoozedUntil?: string;
  aiSummary?: string;
  urgencyScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflowParams {
  status: WorkflowStatus;
  limit?: number;
  offset?: number;
}

export interface IWorkflowResponse {
  data: IEmailWorkflow[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface IUpdateWorkflowStatusParams {
  id: string;
  status: WorkflowStatus;
}

export interface ISnoozeWorkflowParams {
  id: string;
  snoozedUntil: Date;
}
