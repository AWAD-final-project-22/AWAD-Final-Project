import { GetMailboxesUseCase } from './get-mailboxes.use-case';
import { GetEmailsUseCase } from './get-emails.use-case';
import { GetEmailDetailUseCase } from './get-email-detail.use-case';
import { IEmailRepository } from '../../../domain/repositories/email.repository';

export const EmailUseCaseProviders = [
  {
    provide: GetMailboxesUseCase,
    useFactory: (emailRepo: IEmailRepository) =>
      new GetMailboxesUseCase(emailRepo),
    inject: [IEmailRepository],
  },
  {
    provide: GetEmailsUseCase,
    useFactory: (emailRepo: IEmailRepository) =>
      new GetEmailsUseCase(emailRepo),
    inject: [IEmailRepository],
  },
  {
    provide: GetEmailDetailUseCase,
    useFactory: (emailRepo: IEmailRepository) =>
      new GetEmailDetailUseCase(emailRepo),
    inject: [IEmailRepository],
  },
];

export const EmailUseCases = [
  GetMailboxesUseCase,
  GetEmailsUseCase,
  GetEmailDetailUseCase,
];
