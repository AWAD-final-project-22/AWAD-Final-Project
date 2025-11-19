import { IEmailRepository } from '../../domain/repositories/email.repository';
import mailboxes from '../mock/email/mailboxes.json';
import emails from '../mock/email/emails.json';
import emailDetails from '../mock/email/email-details.json';

export class MockEmailRepository implements IEmailRepository {
  async getMailboxes() {
    return mailboxes;
  }

  async getEmailsByMailbox(mailboxId: string) {
    return emails.filter((e) => e.mailboxId === mailboxId);
  }

  async getEmailDetail(emailId: string) {
    return emailDetails[emailId];
  }
}
