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
import type { IEmailWorkflowRepository } from '../domain/repositories/IEmailWorkFflowRepository';
import { AiSummaryService } from './services/ai-summary.service';
import { EmailProcessorService } from './services/email-processor.service';
import { InboxWorkflowService } from './services/inbox-workflow.service';
import { GmailTokenService } from './services/gmail-token.service';
import { GmailLabelSyncService } from './services/gmail-label-sync.service';
import {
  KanbanColumnRepositoryImpl,
  KanbanCardRepositoryImpl,
} from './repositories/kanban.repository.impl';
import { RedisService } from './services/redis.service';
import { GeminiEmbeddingService } from './services/gemini-embedding.service';
import type { IEmbeddingPort } from '../application/ports/embedding.port';
import { EmbeddingQueue } from './queues/embedding.queue';
import { EmbeddingProcessorService } from './services/embedding-processor.service';
import { EmbeddingWorker } from './workers/embedding.worker';
import { EmbeddingQueueService } from './services/embedding-queue.service';
import { SummaryQueue } from './queues/summary.queue';
import { SummaryProcessorService } from './services/summary-processor.service';
import { SummaryWorker } from './workers/summary.worker';
import { AutoReturnService } from './services/auto-return.service';

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
    RedisService,
    {
      provide: 'IEmbeddingPort',
      useClass: GeminiEmbeddingService,
    },
    EmbeddingQueue,
    EmbeddingProcessorService,
    EmbeddingWorker,
    {
      provide: EmbeddingQueueService,
      useFactory: (embeddingQueue?: EmbeddingQueue) => new EmbeddingQueueService(embeddingQueue),
      inject: [{ token: EmbeddingQueue, optional: true }],
    },
    // Summary Worker System
    SummaryQueue,
    SummaryProcessorService,
    SummaryWorker,
    // Auto Return Service
    AutoReturnService,
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
    RedisService,
    'IEmbeddingPort',
    EmbeddingQueue,
    EmbeddingProcessorService,
    EmbeddingWorker,
    EmbeddingQueueService,
    // Summary Worker System
    SummaryQueue,
    SummaryProcessorService,
    SummaryWorker,
    JwtModule,
  ],
})
export class InfrastructureModule {}
