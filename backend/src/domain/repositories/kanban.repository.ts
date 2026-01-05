import {
  KanbanColumn,
  CreateKanbanColumnInput,
  UpdateKanbanColumnInput,
} from '../entities/kanban-column.entity';
import {
  KanbanCard,
  CreateKanbanCardInput,
} from '../entities/kanban-card.entity';

export abstract class IKanbanColumnRepository {
  abstract create(input: CreateKanbanColumnInput): Promise<KanbanColumn>;
  abstract findById(id: string): Promise<KanbanColumn | null>;
  abstract findByUserId(userId: string): Promise<KanbanColumn[]>;
  abstract findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<KanbanColumn | null>;
  abstract update(
    id: string,
    input: UpdateKanbanColumnInput,
  ): Promise<KanbanColumn>;
  abstract delete(id: string): Promise<void>;
  abstract getMaxOrder(userId: string): Promise<number>;
}

export abstract class IKanbanCardRepository {
  abstract create(input: CreateKanbanCardInput): Promise<KanbanCard>;
  abstract findById(id: string): Promise<KanbanCard | null>;
  abstract findByEmailId(
    userId: string,
    emailId: string,
  ): Promise<KanbanCard | null>;
  abstract findByColumnId(columnId: string): Promise<KanbanCard[]>;
  abstract updateColumn(cardId: string, columnId: string): Promise<KanbanCard>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByColumnId(columnId: string): Promise<void>;
}
