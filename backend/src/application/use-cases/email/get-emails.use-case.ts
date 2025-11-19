import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import { Email } from '../../../domain/entities/email.entity';

export class GetEmailsUseCase {
  constructor(private repo: IEmailRepository) {}

  /**
   * Retrieve emails for a given mailbox.
   * @param mailboxId - non-empty mailbox identifier
   */
  async execute(mailboxId: string): Promise<Email[]> {
    if (!mailboxId || typeof mailboxId !== 'string') {
      throw new Error('mailboxId is required');
    }

    return this.repo.getEmailsByMailbox(mailboxId);
  }
}
