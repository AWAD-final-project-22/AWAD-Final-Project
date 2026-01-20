import { CreateColumnUseCase } from './create-column.use-case';
import { UpdateColumnUseCase } from './update-column.use-case';
import { DeleteColumnUseCase } from './delete-column.use-case';
import { GetColumnsUseCase } from './get-columns.use-case';
import { MoveCardUseCase } from './move-card.use-case';
import {
  IKanbanColumnRepository,
  IKanbanCardRepository,
} from '../../../domain/repositories/kanban.repository';
import { GmailLabelSyncService } from '../../../infrastructure/services/gmail-label-sync.service';

export const KanbanUseCaseProviders = [
  {
    provide: CreateColumnUseCase,
    useFactory: (columnRepo: IKanbanColumnRepository) =>
      new CreateColumnUseCase(columnRepo),
    inject: ['IKanbanColumnRepository'],
  },
  {
    provide: UpdateColumnUseCase,
    useFactory: (columnRepo: IKanbanColumnRepository) =>
      new UpdateColumnUseCase(columnRepo),
    inject: ['IKanbanColumnRepository'],
  },
  {
    provide: DeleteColumnUseCase,
    useFactory: (
      columnRepo: IKanbanColumnRepository,
      cardRepo: IKanbanCardRepository,
    ) => new DeleteColumnUseCase(columnRepo, cardRepo),
    inject: ['IKanbanColumnRepository', 'IKanbanCardRepository'],
  },
  {
    provide: GetColumnsUseCase,
    useFactory: (columnRepo: IKanbanColumnRepository) =>
      new GetColumnsUseCase(columnRepo),
    inject: ['IKanbanColumnRepository'],
  },
  {
    provide: MoveCardUseCase,
    useFactory: (
      columnRepo: IKanbanColumnRepository,
      cardRepo: IKanbanCardRepository,
      gmailLabelSyncService: GmailLabelSyncService,
    ) => new MoveCardUseCase(columnRepo, cardRepo, gmailLabelSyncService),
    inject: [
      'IKanbanColumnRepository',
      'IKanbanCardRepository',
      GmailLabelSyncService,
    ],
  },
];

export const KanbanUseCases = [
  CreateColumnUseCase,
  UpdateColumnUseCase,
  DeleteColumnUseCase,
  GetColumnsUseCase,
  MoveCardUseCase,
];

export {
  CreateColumnUseCase,
  UpdateColumnUseCase,
  DeleteColumnUseCase,
  GetColumnsUseCase,
  MoveCardUseCase,
};
