import { GetWorkflowsUseCase } from './get-workflows.use-case';
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
];

export const WorkflowUseCases = [GetWorkflowsUseCase];
