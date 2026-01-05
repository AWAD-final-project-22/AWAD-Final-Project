export interface KanbanColumn {
  id: string;
  userId: string;
  name: string;
  label: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKanbanColumnInput {
  userId: string;
  name: string;
  label: string;
  order?: number;
}

export interface UpdateKanbanColumnInput {
  name?: string;
  label?: string;
  order?: number;
}
