export interface KanbanCard {
  id: string;
  emailId: string;
  columnId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKanbanCardInput {
  emailId: string;
  columnId: string;
  userId: string;
}

export interface MoveKanbanCardInput {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
}
