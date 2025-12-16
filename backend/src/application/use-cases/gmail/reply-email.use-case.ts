import { IGmailService, SendMessageParams, EmailAttachment, GmailHeader } from '../../ports/gmail.port';
import { BaseGmailUseCase } from './base-gmail.use-case';

export interface ReplyEmailParams {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  includeOriginal?: boolean;
  attachments?: EmailAttachment[];
}

export class ReplyEmailUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string, params: ReplyEmailParams) {
    const accessToken = await this.getAccessToken(userId);

    const originalMessage = await this.gmailService.getMessage(
      accessToken,
      'me',
      messageId,
    );

    const headers = originalMessage.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: GmailHeader) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || '';

    const originalFrom = getHeader('From');
    const originalSubject = getHeader('Subject');
    const originalTo = getHeader('To');
    const messageIdHeader = getHeader('Message-ID');

    let replyBody = params.body;
    
    if (params.includeOriginal) {
      replyBody += `
        <br><br>
        <div style="border-left: 2px solid #ccc; padding-left: 10px; color: #666;">
          <p><strong>On ${getHeader('Date')}, ${originalFrom} wrote:</strong></p>
          ${originalMessage.snippet}
        </div>
      `;
    }

    const replyParams: SendMessageParams = {
      to: params.to || [originalFrom],
      cc: params.cc,
      bcc: params.bcc,
      subject: originalSubject.startsWith('Re:') 
        ? originalSubject 
        : `Re: ${originalSubject}`,
      body: replyBody,
      threadId: originalMessage.threadId,
      replyToMessageId: messageIdHeader,
      attachments: params.attachments,
    };

    const result = await this.gmailService.sendMessage(accessToken, replyParams);

    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  }
}