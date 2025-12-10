export interface IAiSummaryPort {
  summarizeEmail(emailBody: string, subject: string): Promise<AiSummaryResult>;
  summarizeEmailBatch(emails: {id: string, subject: string, body: string}[]): Promise<{[id: string]: AiSummaryResult}>;
}

export interface AiSummaryResult {
  summary: string;
  urgencyScore: number;
}
