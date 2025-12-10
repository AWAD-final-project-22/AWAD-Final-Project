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

  async getInboxWorkflows(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<InboxWorkflowResult> {
    this.logger.log(`[INBOX] Fetching from Gmail API (limit: ${limit}, offset: ${offset})`);

    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    // Gmail API không hỗ trợ offset số, nên phải lấy nhiều hơn rồi slice thủ công
    // Giả sử lấy tối đa 100 email gần nhất, sau đó slice theo offset/limit FE truyền vào
    const fetchCount = Math.max(limit + offset, 20);
    const gmailResponse = await this.gmailService.listMessages(accessToken, {
      labelIds: ['INBOX'],
      maxResults: fetchCount,
    });

    this.logger.log(`[Gmail API] Fetched ${gmailResponse.messages?.length || 0} emails`);

    if (!gmailResponse.messages || gmailResponse.messages.length === 0) {
      return { data: [], total: 0 };
    }

    // Slice theo offset/limit FE truyền vào
    const allMessageIds = gmailResponse.messages.map((msg: any) => msg.id);
    const messageIds = allMessageIds.slice(offset, offset + limit);
    const processedEmails = await this.emailProcessorService.processBatchGmailEmails(
      userId,
      messageIds,
    );

    // Count total
    const total = await this.workflowRepository.countByUserAndStatus(
      userId,
      WorkflowStatus.INBOX,
    );

    return { data: processedEmails, total };
  }
}
