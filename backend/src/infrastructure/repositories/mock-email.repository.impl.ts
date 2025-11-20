import { IEmailRepository } from '../../domain/repositories/email.repository';
import { Email } from '../../domain/entities/email.entity';
import { Mailbox } from '../../domain/entities/mailbox.entity';
import mailboxes from '../mock/email/mailboxes.json';
import emails from '../mock/email/emails.json';
import emailDetails from '../mock/email/email-details.json';

export class MockEmailRepositoryImpl implements IEmailRepository {
  async getMailboxes(): Promise<Mailbox[]> {
    return mailboxes;
  }

  async getEmailsByMailbox(mailboxId: string): Promise<Email[]> {
    return emails.filter((e) => e.mailboxId === mailboxId);
  }

  async getEmailDetail(emailId: string): Promise<Email> {
    return emailDetails[emailId] as Email;
  }
}
