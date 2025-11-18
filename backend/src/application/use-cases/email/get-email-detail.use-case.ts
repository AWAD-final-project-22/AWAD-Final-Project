import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import { Email } from '../../../domain/entities/email.entity';

export class GetEmailDetailUseCase {
  constructor(private repo: IEmailRepository) {}

  /**
   * Retrieve a single email by id.
   * @param emailId - non-empty email identifier
   * @returns the Email domain object
   */
  async execute(emailId: string): Promise<Email> {
    if (!emailId || typeof emailId !== 'string') {
      throw new Error('emailId is required');
    }

    return this.repo.getEmailDetail(emailId);
  }
}
