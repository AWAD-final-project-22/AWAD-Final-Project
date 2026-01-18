import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { WorkflowStatus } from '@prisma/client';
import { IGmailService } from '../../application/ports/gmail.port';
import type { IAiSummaryPort } from '../../application/ports/ai-summary.port';
import { GmailTokenService } from './gmail-token.service';
import { SummaryQueue } from '../queues/summary.queue';

@Injectable()
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);

  constructor(
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,

    @Inject(IGmailService)
    private readonly gmailService: IGmailService,
    private readonly gmailTokenService: GmailTokenService,

    @Inject('IAiSummaryPort')
    private readonly aiSummaryPort: IAiSummaryPort,
    
    private readonly summaryQueue: SummaryQueue,
  ) {}

  async processGmailEmail(
    userId: string,
    gmailMessageId: string,
  ): Promise<EmailWorkflowEntity> {
    const existingWorkflow = await this.workflowRepository.findByGmailMessageId(
      userId,
      gmailMessageId,
    );

    const isAiSummaryInvalid =
      !existingWorkflow?.aiSummary ||
      existingWorkflow.aiSummary.trim() === '' ||
      existingWorkflow.aiSummary.includes('AI summarization failed');

    if (existingWorkflow && !isAiSummaryInvalid) {
      this.logger.log(`[Email ${gmailMessageId}] Found in DB, aiSummary OK`);
      return existingWorkflow;
    }

    this.logger.log(`[Email ${gmailMessageId}] ${existingWorkflow ? 'Found in DB but aiSummary invalid, will queue for re-processing' : 'Not in DB, fetching full email'}`);

    const accessToken = await this.gmailTokenService.getAccessToken(userId);
    const fullEmail = await this.gmailService.getMessage(accessToken, 'me', gmailMessageId);

    const headers = fullEmail.payload?.headers || [];
    const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'unknown@example.com';
    const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;

    const hasAttachment = this.hasAttachment(fullEmail.payload);
    const isRead = !(fullEmail.labelIds?.includes('UNREAD') ?? false);

    let newWorkflow;
    if (existingWorkflow) {
      // If workflow exists but has invalid summary, just queue it for re-processing
      newWorkflow = existingWorkflow;
      this.logger.log(`[Email ${gmailMessageId}] Existing workflow found, will queue for AI summary`);
    } else {
      // Create new workflow WITHOUT AI summary (will be processed asynchronously)
      newWorkflow = await this.workflowRepository.create({
        userId,
        gmailMessageId,
        subject,
        from,
        date: new Date(date || Date.now()),
        snippet: fullEmail.snippet || '',
        hasAttachment: hasAttachment,
        isRead: isRead,
        status: WorkflowStatus.INBOX,
        priority: 0,
        aiSummary: undefined, 
        urgencyScore: undefined,
      });
      this.logger.log(`[Email ${gmailMessageId}] Saved to DB (AI summary pending)`);
    }

    // Queue AI summary processing (async)
    try {
      await this.summaryQueue.addBatchJob({
        emailIds: [gmailMessageId],
        userId,
      });
      this.logger.log(`[Email ${gmailMessageId}] Queued for AI summary processing`);
    } catch (error) {
      this.logger.error(`[Email ${gmailMessageId}] Failed to queue AI summary job:`, error);
    }

    return newWorkflow;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async processBatchGmailEmails(
    userId: string,
    gmailMessageIds: string[],
  ): Promise<EmailWorkflowEntity[]> {
    const results: EmailWorkflowEntity[] = [];
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    const toProcess: string[] = [];
    for (const messageId of gmailMessageIds) {
      const existing = await this.workflowRepository.findByGmailMessageId(userId, messageId);
      if (existing) {
        this.logger.log(`[Batch] Email ${messageId} đã có trong DB, bỏ qua.`);
        results.push(existing);
      } else {
        toProcess.push(messageId);
      }
    }

    const fullEmails: any[] = [];
    for (const messageId of toProcess) {
      try {
        this.logger.log(`[Batch] Fetching full email: ${messageId}`);
        const fullEmail = await this.gmailService.getMessage(accessToken, 'me', messageId);
        fullEmails.push({ messageId, fullEmail });
      } catch (error) {
        this.logger.error(`[Batch] Failed to fetch email ${messageId}:`, error);
      }
    }

    // Save emails to database immediately WITHOUT AI summary (async processing)
    const newWorkflows: EmailWorkflowEntity[] = [];
    for (const { messageId, fullEmail } of fullEmails) {
      try {
        const headers = fullEmail.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'unknown@example.com';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;

        const hasAttachment = this.hasAttachment(fullEmail.payload);
        const isRead = !(fullEmail.labelIds?.includes('UNREAD') ?? false);

        // Save email WITHOUT AI summary (will be processed asynchronously)
        const newWorkflow = await this.workflowRepository.create({
          userId,
          gmailMessageId: messageId,
          subject,
          from,
          date: new Date(date || Date.now()),
          snippet: fullEmail.snippet || '',
          hasAttachment: hasAttachment,
          isRead: isRead,
          status: WorkflowStatus.INBOX,
          priority: 0,
          aiSummary: undefined, 
          urgencyScore: undefined,
        });
        
        this.logger.log(`[Batch] Saved email ${messageId} to DB (AI summary pending)`);
        results.push(newWorkflow);
        newWorkflows.push(newWorkflow);
      } catch (error) {
        this.logger.error(`[Batch] Failed to save email ${messageId}:`, error);
      }
    }

    // Queue AI summary processing for new emails (async)
    if (newWorkflows.length > 0) {
      const emailIds = newWorkflows.map(w => w.gmailMessageId);
      try {
        await this.summaryQueue.addBatchJob({
          emailIds,
          userId,
        });
        this.logger.log(`[Batch] Queued ${emailIds.length} emails for AI summary processing`);
      } catch (error) {
        this.logger.error(`[Batch] Failed to queue AI summary jobs:`, error);
      }
    }

    return results;
  }

  private hasAttachment(payload: any): boolean {
    if (!payload?.parts) return false;
    
    const checkParts = (parts: any[]): boolean => {
      for (const part of parts) {
        if (part.filename && part.filename.trim() !== '') {
          return true;
        }
        if (part.parts && checkParts(part.parts)) {
          return true;
        }
      }
      return false;
    };
    
    return checkParts(payload.parts);
  }
}
