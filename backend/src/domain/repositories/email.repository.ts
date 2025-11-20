import { Email } from '../entities/email.entity';
import { Mailbox } from '../entities/mailbox.entity';

export abstract class IEmailRepository {
  abstract getMailboxes(): Promise<Mailbox[]>;
  abstract getEmailsByMailbox(mailboxId: string): Promise<Email[]>;
  abstract getEmailDetail(emailId: string): Promise<Email>;
}
