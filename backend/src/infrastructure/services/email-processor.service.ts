import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { WorkflowStatus } from '@prisma/client';
import { IGmailService } from '../../application/ports/gmail.port';
import type { IAiSummaryPort } from '../../application/ports/ai-summary.port';
import { GmailTokenService } from './gmail-token.service';

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
  ) {}

  async processGmailEmail(
    userId: string,
    gmailMessageId: string,
  ): Promise<EmailWorkflowEntity> {
    const existingWorkflow = await this.workflowRepository.findByGmailMessageId(
      userId,
      gmailMessageId,
    );

    if (existingWorkflow) {
      this.logger.log(`[Email ${gmailMessageId}] Found in DB`);
      return existingWorkflow;
    }

    this.logger.log(`[Email ${gmailMessageId}] Not in DB, fetching full email`);
    
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    const fullEmail = await this.gmailService.getMessage(accessToken, 'me', gmailMessageId);

    const headers = fullEmail.payload?.headers || [];
    const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'unknown@example.com';
    const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;
    
    let body = fullEmail.snippet || '';
    if (fullEmail.payload?.body?.data) {
      body = Buffer.from(fullEmail.payload.body.data, 'base64').toString('utf-8');
    } else if (fullEmail.payload?.parts) {
      const textPart = fullEmail.payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    this.logger.log(`[Email ${gmailMessageId}] Calling AI summarize`);
    const { summary, urgencyScore } = await this.aiSummaryPort.summarizeEmail(
      body || fullEmail.snippet || '',
      subject,
    );

    const newWorkflow = await this.workflowRepository.create({
      userId,
      gmailMessageId,
      subject,
      from,
      date: new Date(date || Date.now()),
      snippet: fullEmail.snippet || '',
      status: WorkflowStatus.INBOX,
      priority: 0,
      aiSummary: summary,
      urgencyScore,
    });

    this.logger.log(`[Email ${gmailMessageId}] Saved to DB`);
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

    const batchInput = fullEmails.map(({ messageId, fullEmail }) => {
      const headers = fullEmail.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      let body = fullEmail.snippet || '';
      if (fullEmail.payload?.body?.data) {
        body = Buffer.from(fullEmail.payload.body.data, 'base64').toString('utf-8');
      } else if (fullEmail.payload?.parts) {
        const textPart = fullEmail.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }
      return { id: messageId, subject, body };
    });

    if (batchInput.length > 0) {
      this.logger.log(`[Batch] Calling AI summarize for ${batchInput.length} emails...`);
      const aiResults = await this.aiSummaryPort.summarizeEmailBatch(batchInput);

      for (const { messageId, fullEmail } of fullEmails) {
        try {
          const headers = fullEmail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'unknown@example.com';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;
          let body = fullEmail.snippet || '';
          if (fullEmail.payload?.body?.data) {
            body = Buffer.from(fullEmail.payload.body.data, 'base64').toString('utf-8');
          } else if (fullEmail.payload?.parts) {
            const textPart = fullEmail.payload.parts.find((p: any) => p.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
          }
          const aiResult = aiResults[messageId] || { summary: 'AI summarization failed', urgencyScore: 0.5 };
          const newWorkflow = await this.workflowRepository.create({
            userId,
            gmailMessageId: messageId,
            subject,
            from,
            date: new Date(date || Date.now()),
            snippet: fullEmail.snippet || '',
            status: WorkflowStatus.INBOX,
            priority: 0,
            aiSummary: aiResult.summary,
            urgencyScore: aiResult.urgencyScore,
          });
          this.logger.log(`[Batch] Saved email ${messageId} to DB`);
          results.push(newWorkflow);
        } catch (error) {
          this.logger.error(`[Batch] Failed to save email ${messageId}:`, error);
        }
      }
    }
    return results;
  }
}
