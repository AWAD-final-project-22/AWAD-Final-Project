import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import {
  generateCacheKey,
  logOfflineCache,
  readCache,
  STORES,
  writeCache,
} from '@/helpers/offlineCache.helper';
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
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
  const queryClient = useQueryClient();
  const queryKey = [...kanbanKeys.columns(), userId];
  const cacheKey = generateCacheKey(userId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cached = await readCache<IKanbanColumn[]>(STORES.kanbanColumns, cacheKey);
      logOfflineCache('kanban columns cache read', { cacheKey, hit: !!cached });
      if (!isOnline) {
        logOfflineCache('kanban columns offline return', { cacheKey, hit: !!cached });
        return cached || [];
      }

      const fetchAndUpdate = async () => {
        logOfflineCache('kanban columns fetch start', { cacheKey });
        const response: AxiosResponse<IKanbanColumnsResponse> =
          await getKanbanColumns();
        await writeCache(STORES.kanbanColumns, cacheKey, response.data.data);
        queryClient.setQueryData(queryKey, response.data.data);
        logOfflineCache('kanban columns fetch success', {
          cacheKey,
          count: response.data?.data?.length,
        });
        return response.data.data;
      };

      if (cached) {
        logOfflineCache('kanban columns return cached', { cacheKey });
        setTimeout(() => {
          logOfflineCache('kanban columns background fetch', { cacheKey });
          fetchAndUpdate().catch((error) => {
            console.warn('[offline-cache] kanban columns refresh failed', error);
          });
        }, 0);
        return cached;
      }

      logOfflineCache('kanban columns cache miss', { cacheKey });
      return fetchAndUpdate();
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
