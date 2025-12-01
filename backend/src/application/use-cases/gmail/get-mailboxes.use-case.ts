import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';

export class GetMailboxesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly gmailService: IGmailService,
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not linked with Google');
    }

    return [
      { id: 'INBOX', name: 'Inbox' },
      { id: 'SENT', name: 'Sent' },
      { id: 'DRAFT', name: 'Drafts' },
      { id: 'TRASH', name: 'Trash' },
      { id: 'SPAM', name: 'Spam' },
    ];
  }
}
