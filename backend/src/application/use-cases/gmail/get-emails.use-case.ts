import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService, GmailMessage } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';

const SYSTEM_LABELS_MAP: Record<string, string> = {
  inbox: 'INBOX',
  sent: 'SENT',
  drafts: 'DRAFT',
  trash: 'TRASH',
  spam: 'SPAM',
  starred: 'STARRED',
  important: 'IMPORTANT',
};

export class GetEmailsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly gmailService: IGmailService,
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(userId: string, mailboxId: string = 'INBOX') {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not linked with Google');
    }

    const accessToken = this.encryptionService.decrypt(user.googleAccessToken);

    // Normalize mailboxId and map to Gmail Label ID
    const normalizedId = mailboxId.toLowerCase();
    const labelId = SYSTEM_LABELS_MAP[normalizedId] || mailboxId;

    // Query theo Label
    const query = `label:${labelId}`;

    const messages = await this.gmailService.listMessages(
      accessToken,
      'me',
      query,
      20,
    );

    return messages.map((msg) => this.mapToEmailEntity(msg, mailboxId));
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
