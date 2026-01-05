import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import {
  getKanbanColumns,
  createKanbanColumn,
  updateKanbanColumn,
  deleteKanbanColumn,
} from '../services/kanbanQueries';
import {
  IKanbanColumn,
  IKanbanColumnsResponse,
  ICreateColumnInput,
  IUpdateColumnInput,
} from '../interfaces/kanbanColumn.interface';

export const kanbanKeys = {
  all: ['kanban'] as const,
  columns: () => [...kanbanKeys.all, 'columns'] as const,
};

export const useGetKanbanColumns = () => {
  return useQuery({
    queryKey: kanbanKeys.columns(),
    queryFn: async () => {
      const response: AxiosResponse<IKanbanColumnsResponse> =
        await getKanbanColumns();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

interface UseMutationColumnOptions {
  onSuccess?: (data: IKanbanColumn) => void;
  onError?: (error: Error) => void;
}

export const useMutationCreateColumn = (options?: UseMutationColumnOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ICreateColumnInput) => {
      const response = await createKanbanColumn(input);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.columns() });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

export const useMutationUpdateColumn = (options?: UseMutationColumnOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; input: IUpdateColumnInput }) => {
      const response = await updateKanbanColumn(params.id, params.input);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.columns() });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

interface UseMutationDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useMutationDeleteColumn = (options?: UseMutationDeleteOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteKanbanColumn(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.columns() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
