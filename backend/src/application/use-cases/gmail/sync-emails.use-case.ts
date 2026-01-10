import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { BaseGmailUseCase } from './base-gmail.use-case';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';
import { WorkflowStatus } from '@prisma/client';
import { EmbeddingQueueService } from '../../../infrastructure/services/embedding-queue.service';

@Injectable()
export class SyncEmailsUseCase extends BaseGmailUseCase {
  private readonly logger = new Logger(SyncEmailsUseCase.name);

  constructor(
    userRepository: IUserRepository,
    gmailService: IGmailService,
    encryptionService: IEncryptionService,
    @Inject('IEmailWorkflowRepository')
    private readonly emailWorkflowRepository: IEmailWorkflowRepository,
    @Optional() private readonly embeddingQueueService?: EmbeddingQueueService,
  ) {
    super(userRepository, gmailService, encryptionService);
  }

  async execute(userId: string, limit: number = 50): Promise<{ synced: number; total: number }> {
    const accessToken = await this.getAccessToken(userId);

    const response = await this.gmailService.listMessages(accessToken, {
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: limit,
    });

    const emails = response.messages || [];
    
    const emailWorkflows = emails.map((email) => {
      const headers = email.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const hasAttachment = this.checkForAttachments(email);
      // Check if email is read: if labelIds includes 'UNREAD', then isRead = false
      const isRead = !(email.labelIds?.includes('UNREAD') ?? false);

      return {
        id: email.id,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From') || 'unknown@example.com',
        date: new Date(Number(email.internalDate)),
        snippet: email.snippet,
        hasAttachment,
        isRead,
        status: WorkflowStatus.INBOX,
        priority: 0,
      };
    });

    await this.emailWorkflowRepository.syncFromGmail(userId, emailWorkflows);

    // Queue embedding jobs only for emails that don't have embeddings yet
    if (this.embeddingQueueService && emailWorkflows.length > 0) {
      const emailIds = emailWorkflows.map(e => e.id).filter(Boolean);
      this.logger.log(`[SYNC EMAILS] Checking embedding status for ${emailIds.length} synced emails`);
      
      // Fetch workflows from database to check embedding status
      const workflows: any[] = [];
      for (const emailId of emailIds) {
        const workflow = await this.emailWorkflowRepository.findByGmailMessageId(userId, emailId);
        if (workflow) {
          workflows.push(workflow);
        }
      }

      // Use service to queue embedding jobs
      await this.embeddingQueueService.queuePendingEmbeddings(userId, workflows).catch((err) => {
        this.logger.error(`[SYNC EMAILS] Failed to queue embedding jobs:`, err);
      });
    }

    return {
      synced: emailWorkflows.length,
      total: response.resultSizeEstimate || 0,
    };
  }

  private checkForAttachments(email: any): boolean {
    const checkParts = (parts: any[]): boolean => {
      if (!parts) return false;
      
      for (const part of parts) {
        if (part.body?.attachmentId) {
          return true;
        }
        if (part.parts && checkParts(part.parts)) {
          return true;
        }
      }
      return false;
    };

    return checkParts(email.payload?.parts);
  }
}