import { IEmailRepository } from '../../../domain/repositories/email.repository';
import { Mailbox } from '../../../domain/entities/mailbox.entity';

export class GetMailboxesUseCase {
  constructor(private repo: IEmailRepository) {}

  /**
   * Retrieve all mailboxes.
   * Returns an array of `Mailbox` domain objects.
   */
  async execute(): Promise<Mailbox[]> {
    return this.repo.getMailboxes();
  }
}
