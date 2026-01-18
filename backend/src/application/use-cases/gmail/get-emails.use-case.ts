import { GmailMessage, ListMessagesParams } from '../../ports/gmail.port';
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

export interface EmailFilterOptions {
  sortBy?: 'date_newest' | 'date_oldest';
  unreadOnly?: boolean;
  attachmentsOnly?: boolean;
}

export class GetEmailsUseCase extends BaseGmailUseCase {
  async execute(
    userId: string, 
    mailboxId: string = 'INBOX',
    limit: number = 20,
    offset: number = 0,
    filterOptions?: EmailFilterOptions,
  ) {
    const accessToken = await this.getAccessToken(userId);

    const normalizedId = mailboxId.toLowerCase();
    const labelId = SYSTEM_LABELS_MAP[normalizedId] || mailboxId;

    // Build Gmail search query based on filters
    let query = `in:${labelId}`; // Keep original case for Gmail API
    
    if (filterOptions?.unreadOnly) {
      query += ' is:unread';
    }
    
    if (filterOptions?.attachmentsOnly) {
      query += ' has:attachment';
    }

    const fetchLimit = Math.min(limit + offset, 500);

    const params: ListMessagesParams = {
      userId: 'me',
      query: query, 
      maxResults: fetchLimit,
    };

    const response = await this.gmailService.listMessages(accessToken, params);

    let emails = response.messages.map((msg) => this.mapToEmailEntity(msg, mailboxId));

    if (filterOptions?.sortBy === 'date_oldest') {
      emails = emails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      // Default: newest first
      emails = emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Apply offset and limit
    const paginatedEmails = emails.slice(offset, offset + limit);
    const hasMore = emails.length > offset + limit;

    return {
      emails: paginatedEmails,
      limit,
      offset,
      total: response.resultSizeEstimate || 0,
      hasMore,
      filters: filterOptions,
    };
  }

  private mapToEmailEntity(msg: GmailMessage, mailboxId: string) {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
      '';

    // Check for attachments
    const hasAttachment = this.hasAttachment(msg.payload);

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
      hasAttachment,
      mailboxId: mailboxId,
    };
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