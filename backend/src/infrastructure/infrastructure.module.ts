import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { PasswordServiceImpl } from './services/password.service';
import { TokenServiceImpl } from './services/token.service';

import { IUserRepository } from '../domain/repositories/user.repository';
import { IPasswordService } from '../application/ports/password.port';
import { ITokenService } from '../application/ports/token.port';
import { EncryptionServiceImpl } from './services/encryption.service';
import { IEncryptionService } from '../application/ports/encryption.port';
import { GmailServiceImpl } from './services/gmail.service';
import { IGmailService } from '../application/ports/gmail.port';
import { EmailWorkflowRepositoryImpl } from './repositories/emailWorkflowRepository.impl';
import { AiSummaryService } from './services/ai-summary.service';
import { EmailProcessorService } from './services/email-processor.service';
import { InboxWorkflowService } from './services/inbox-workflow.service';
import { GmailTokenService } from './services/gmail-token.service';
import { GmailLabelSyncService } from './services/gmail-label-sync.service';
import {
  KanbanColumnRepositoryImpl,
  KanbanCardRepositoryImpl,
} from './repositories/kanban.repository.impl';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'changeme',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: IPasswordService,
      useClass: PasswordServiceImpl,
    },
    {
      provide: ITokenService,
      useClass: TokenServiceImpl,
    },
    {
      provide: IEncryptionService,
      useClass: EncryptionServiceImpl,
    },
    {
      provide: IGmailService,
      useClass: GmailServiceImpl,
    },
    {
      provide: 'IEmailWorkflowRepository',
      useClass: EmailWorkflowRepositoryImpl,
    },
    {
      provide: 'IAiSummaryPort',
      useClass: AiSummaryService,
    },
    {
      provide: 'IKanbanColumnRepository',
      useClass: KanbanColumnRepositoryImpl,
    },
    {
      provide: 'IKanbanCardRepository',
      useClass: KanbanCardRepositoryImpl,
    },
    GmailTokenService,
    GmailLabelSyncService,
    EmailProcessorService,
    InboxWorkflowService,
  ],
  exports: [
    PrismaService,
    IEncryptionService,
    IUserRepository,
    IPasswordService,
    ITokenService,
    IGmailService,
    'IEmailWorkflowRepository',
    'IAiSummaryPort',
    'IKanbanColumnRepository',
    'IKanbanCardRepository',
    GmailTokenService,
    GmailLabelSyncService,
    EmailProcessorService,
    InboxWorkflowService,
    JwtModule,
  ],
})
export class InfrastructureModule {}
