import { IGmailService, GmailMessage, ListMessagesParams } from '../../ports/gmail.port';
import { BaseGmailUseCase } from './base-gmail.use-case';

const SYSTEM_LABELS_MAP: Record<string, string> = {
  inbox: 'INBOX',
  sent: 'SENT',
  drafts: 'DRAFT',
  trash: 'TRASH',
  spam: 'SPAM',
  starred: 'STARRED',
  important: 'IMPORTANT',
};

export class GetEmailsUseCase extends BaseGmailUseCase {
  async execute(
    userId: string, 
    mailboxId: string = 'INBOX',
    page: number = 1,
    limit: number = 20,
  ) {
    const accessToken = await this.getAccessToken(userId);

    // Normalize mailboxId and map to Gmail Label ID
    const normalizedId = mailboxId.toLowerCase();
    const labelId = SYSTEM_LABELS_MAP[normalizedId] || mailboxId;

    // Params cho Gmail API
    const params: ListMessagesParams = {
      userId: 'me',
      labelIds: [labelId],
      maxResults: limit,
    };

    const response = await this.gmailService.listMessages(accessToken, params);

    return {
      emails: response.messages.map((msg) => this.mapToEmailEntity(msg, mailboxId)),
      page,
      limit,
      total: response.resultSizeEstimate || 0,
    };
  }

  private mapToEmailEntity(msg: GmailMessage, mailboxId: string) {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
      '';

    return {
      id: msg.id,
      threadId: msg.threadId,
      subject: getHeader('Subject') || '(No Subject)',
      sender: getHeader('From'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: new Date(Number(msg.internalDate)).toISOString(),
      snippet: msg.snippet,
      preview: msg.snippet,
      isRead: !(msg.labelIds?.includes('UNREAD') ?? false),
      isStarred: msg.labelIds?.includes('STARRED') ?? false,
      mailboxId: mailboxId,
    };
  }
}
