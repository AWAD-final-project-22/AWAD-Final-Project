import { IGmailService, SendMessageParams, EmailAttachment, GmailHeader } from '../../ports/gmail.port';
import { BaseGmailUseCase } from './base-gmail.use-case';

export interface ForwardEmailParams {
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  includeOriginal?: boolean;
  attachments?: EmailAttachment[];
}

export class ForwardEmailUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string, params: ForwardEmailParams) {
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
    const originalDate = getHeader('Date');

    let forwardBody = params.body;
    
    if (params.includeOriginal) {
      forwardBody += `
        <br><br>
        <div style="border-left: 2px solid #ccc; padding-left: 10px; color: #666;">
          <p><strong>---------- Forwarded message ----------</strong></p>
          <p><strong>From:</strong> ${originalFrom}</p>
          <p><strong>Date:</strong> ${originalDate}</p>
          <p><strong>Subject:</strong> ${originalSubject}</p>
          <br>
          ${originalMessage.snippet}
        </div>
      `;
    }

    const forwardParams: SendMessageParams = {
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: originalSubject.startsWith('Fwd:') 
        ? originalSubject 
        : `Fwd: ${originalSubject}`,
      body: forwardBody,
      attachments: params.attachments,
    };

    const result = await this.gmailService.sendMessage(accessToken, forwardParams);

    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  }
}

