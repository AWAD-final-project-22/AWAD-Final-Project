import { Email } from '../entities/email.entity';
import { Mailbox } from '../entities/mailbox.entity';

export interface IEmailRepository {
  getMailboxes(): Promise<Mailbox[]>;
  getEmailsByMailbox(mailboxId: string): Promise<Email[]>;
  getEmailDetail(emailId: string): Promise<Email>;
}