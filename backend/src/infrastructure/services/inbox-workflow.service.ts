import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { WorkflowStatus } from '@prisma/client';
import { IGmailService } from '../../application/ports/gmail.port';
import { EmailProcessorService } from './email-processor.service';
import { GmailTokenService } from './gmail-token.service';

export interface InboxWorkflowResult {
  data: EmailWorkflowEntity[];
  total: number;
}

@Injectable()
export class InboxWorkflowService {
  private readonly logger = new Logger(InboxWorkflowService.name);

  constructor(
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,

    @Inject(IGmailService)
    private readonly gmailService: IGmailService,
    private readonly gmailTokenService: GmailTokenService,
    private readonly emailProcessorService: EmailProcessorService,
  ) {}

  
  async syncInboxEmails(userId: string, limit: number): Promise<void> {
    this.logger.log(`[INBOX SYNC] Syncing ${limit} emails from Gmail API`);

    try {
      const accessToken = await this.gmailTokenService.getAccessToken(userId);

      const gmailResponse = await this.gmailService.listMessages(accessToken, {
        labelIds: ['INBOX'],
        maxResults: limit,
      });

      if (!gmailResponse.messages || gmailResponse.messages.length === 0) {
        return;
      }

      const messageIds = gmailResponse.messages.map((msg: any) => msg.id);
      await this.emailProcessorService.processBatchGmailEmails(userId, messageIds);

      this.logger.log(`[INBOX SYNC] Synced ${messageIds.length} emails to database`);
    } catch (error) {
      this.logger.error(`[INBOX SYNC] Failed to sync emails:`, error);
      throw error;
    }
  }
}
