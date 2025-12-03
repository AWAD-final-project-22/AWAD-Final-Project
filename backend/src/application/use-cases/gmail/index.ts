import { GetMailboxesUseCase } from './get-mailboxes.use-case';
import { GetEmailsUseCase } from './get-emails.use-case';
import { GetLabelsUseCase } from './get-labels.use-case';
import { GetEmailDetailUseCase } from './get-email-detail.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IGmailService } from '../../ports/gmail.port';
import { IEncryptionService } from '../../ports/encryption.port';
import { SendEmailUseCase } from './send-email.use-case';
import { ReplyEmailUseCase } from './reply-email.use-case';
import { ModifyEmailUseCase } from './modify-email.use-case';
import { GetAttachmentUseCase } from './get-attachment.use-case';

export const GmailUseCaseProviders = [
  {
    provide: GetMailboxesUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new GetMailboxesUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: GetEmailsUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new GetEmailsUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: GetLabelsUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new GetLabelsUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: GetEmailDetailUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new GetEmailDetailUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: SendEmailUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new SendEmailUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: ReplyEmailUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new ReplyEmailUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: ModifyEmailUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new ModifyEmailUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
  {
    provide: GetAttachmentUseCase,
    useFactory: (
      userRepo: IUserRepository,
      gmailService: IGmailService,
      encryptionService: IEncryptionService,
    ) => new GetAttachmentUseCase(userRepo, gmailService, encryptionService),
    inject: [IUserRepository, IGmailService, IEncryptionService],
  },
];

export const GmailUseCases = [
  GetMailboxesUseCase,
  GetEmailsUseCase,
  GetLabelsUseCase,
  GetEmailDetailUseCase,
  SendEmailUseCase,
  ReplyEmailUseCase,
  ModifyEmailUseCase,
  GetAttachmentUseCase,
];
