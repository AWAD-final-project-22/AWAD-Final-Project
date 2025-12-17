import { GetWorkflowsUseCase } from './get-workflows.use-case';
import { SearchWorkflowsUseCase } from './search-workflow.use-case';
import type { IEmailWorkflowRepository } from '../../../domain/repositories/IEmailWorkFflowRepository';
import { InboxWorkflowService } from '../../../infrastructure/services/inbox-workflow.service';

export const WorkflowUseCaseProviders = [
  {
    provide: GetWorkflowsUseCase,
    useFactory: (
      workflowRepo: IEmailWorkflowRepository,
      inboxWorkflowService: InboxWorkflowService,
    ) => new GetWorkflowsUseCase(workflowRepo, inboxWorkflowService),
    inject: ['IEmailWorkflowRepository', InboxWorkflowService],
  },
  {
    provide: SearchWorkflowsUseCase,
    useFactory: (workflowRepo: IEmailWorkflowRepository) =>
      new SearchWorkflowsUseCase(workflowRepo),
    inject: ['IEmailWorkflowRepository'],
  },
];

export const WorkflowUseCases = [GetWorkflowsUseCase, SearchWorkflowsUseCase];
