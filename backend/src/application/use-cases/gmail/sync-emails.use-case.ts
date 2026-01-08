import { Injectable, Inject } from '@nestjs/common';
import { BaseGmailUseCase } from './base-gmail.use-case';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class SyncEmailsUseCase extends BaseGmailUseCase {
  constructor(
    userRepository: IUserRepository,
    gmailService: IGmailService,
    encryptionService: IEncryptionService,
    @Inject('IEmailWorkflowRepository')
    private readonly emailWorkflowRepository: IEmailWorkflowRepository,
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

      return {
        id: email.id,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From') || 'unknown@example.com',
        date: new Date(Number(email.internalDate)),
        snippet: email.snippet,
        hasAttachment,
        status: WorkflowStatus.INBOX,
        priority: 0,
      };
    });

    await this.emailWorkflowRepository.syncFromGmail(userId, emailWorkflows);

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