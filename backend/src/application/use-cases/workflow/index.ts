import { GetWorkflowsUseCase } from './get-workflows.use-case';
import { SearchWorkflowsUseCase } from './search-workflow.use-case';
import { GetSuggestionsUseCase } from './get-suggestions.use-case';
import { SemanticSearchUseCase } from './semantic-search.use-case';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { InboxWorkflowService } from '../../../infrastructure/services/inbox-workflow.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EmbeddingQueueService } from '../../../infrastructure/services/embedding-queue.service';
import { IEmbeddingPort } from '../../ports/embedding.port';

export const WorkflowUseCaseProviders = [
  {
    provide: GetWorkflowsUseCase,
    useFactory: (
      workflowRepo: IEmailWorkflowRepository,
      inboxWorkflowService: InboxWorkflowService,
      embeddingQueueService?: EmbeddingQueueService,
    ) => new GetWorkflowsUseCase(workflowRepo, inboxWorkflowService, embeddingQueueService),
    inject: ['IEmailWorkflowRepository', InboxWorkflowService, { token: EmbeddingQueueService, optional: true }],
  },
  {
    provide: SearchWorkflowsUseCase,
    useFactory: (workflowRepo: IEmailWorkflowRepository) =>
      new SearchWorkflowsUseCase(workflowRepo),
    inject: ['IEmailWorkflowRepository'],
  },
  {
    provide: GetSuggestionsUseCase,
    useFactory: (prisma: PrismaService) => new GetSuggestionsUseCase(prisma),
    inject: [PrismaService],
  },
  {
    provide: SemanticSearchUseCase,
    useFactory: (
      workflowRepo: IEmailWorkflowRepository,
      embeddingPort?: IEmbeddingPort,
    ) => new SemanticSearchUseCase(workflowRepo, embeddingPort),
    inject: ['IEmailWorkflowRepository', { token: 'IEmbeddingPort', optional: true }],
  },
];

export const WorkflowUseCases = [
  GetWorkflowsUseCase,
  SearchWorkflowsUseCase,
  GetSuggestionsUseCase,
  SemanticSearchUseCase,
];
