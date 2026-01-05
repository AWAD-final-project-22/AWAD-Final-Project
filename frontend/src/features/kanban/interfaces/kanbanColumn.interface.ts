export interface IKanbanColumn {
  id: string;
  userId: string;
  name: string;
  label: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateColumnInput {
  name?: string;
  label: string;
  order?: number;
}

export interface IUpdateColumnInput {
  name?: string;
  label?: string;
  order?: number;
}

export interface IKanbanColumnsResponse {
  success: boolean;
  data: IKanbanColumn[];
}

export interface IKanbanColumnResponse {
  success: boolean;
  data: IKanbanColumn;
}
