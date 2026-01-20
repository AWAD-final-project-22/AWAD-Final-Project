import { API_PATH } from '@/constants/apis.constant';
import axiosClient from '@/services/apis/apiClient';
import { AxiosResponse } from 'axios';
import {
  IKanbanColumnsResponse,
  IKanbanColumnResponse,
  ICreateColumnInput,
  IUpdateColumnInput,
} from '../interfaces/kanbanColumn.interface';

export function getKanbanColumns(): Promise<
  AxiosResponse<IKanbanColumnsResponse>
> {
  return axiosClient.get<IKanbanColumnsResponse>(
    API_PATH.KANBAN.GET_COLUMNS.API_PATH,
  );
}

export function createKanbanColumn(
  input: ICreateColumnInput,
): Promise<AxiosResponse<IKanbanColumnResponse>> {
  return axiosClient.post<IKanbanColumnResponse>(
    API_PATH.KANBAN.CREATE_COLUMN.API_PATH,
    input,
  );
}

export function updateKanbanColumn(
  id: string,
  input: IUpdateColumnInput,
): Promise<AxiosResponse<IKanbanColumnResponse>> {
  return axiosClient.put<IKanbanColumnResponse>(
    API_PATH.KANBAN.UPDATE_COLUMN.API_PATH(id),
    input,
  );
}

export function deleteKanbanColumn(
  id: string,
): Promise<AxiosResponse<{ success: boolean }>> {
  return axiosClient.delete<{ success: boolean }>(
    API_PATH.KANBAN.DELETE_COLUMN.API_PATH(id),
  );
}
