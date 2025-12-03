import { BaseGmailUseCase } from './base-gmail.use-case';

export class GetEmailDetailUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string) {
    const accessToken = await this.getAccessToken(userId);

    const message = await this.gmailService.getMessage(
      accessToken,
      'me',
      messageId,
    );

    return this.mapToEmailDetail(message);
  }

  private mapToEmailDetail(msg: any) {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || '';

    // Parse body content
    let body = '';
    if (msg.payload?.body?.data) {
      body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
    } else if (msg.payload?.parts) {
      // Multipart email - tìm phần text/html hoặc text/plain
      for (const part of msg.payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        } else if (part.mimeType === 'text/plain' && part.body?.data && !body) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    // Parse attachments
    const attachments: any[] = [];
    if (msg.payload?.parts) {
      for (const part of msg.payload.parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size || 0,
          });
        }
      }
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      subject: getHeader('Subject') || '(No Subject)',
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      date: new Date(Number(msg.internalDate)).toISOString(),
      snippet: msg.snippet,
      body: body || msg.snippet,
      isRead: !msg.labelIds.includes('UNREAD'),
      isStarred: msg.labelIds.includes('STARRED'),
      labelIds: msg.labelIds,
      attachments,
    };
  }
}
