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
  getWorkflowsByStatus,
  updateWorkflowStatus,
  updateWorkflowSnooze,
  createOrUpdateWorkflow,
} from '../services/workflowQueries';
import {
  IWorkflowParams,
  IWorkflowResponse,
  IEmailWorkflow,
  WorkflowStatus,
} from '../interfaces/workflow.interface';

// Query key factory
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (params: IWorkflowParams) => [...workflowKeys.lists(), params] as const,
};

// Hook to get workflows by status
export const useGetWorkflows = (params: IWorkflowParams) => {
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
  const queryClient = useQueryClient();
  const limit = params.limit || 0;
  const offset = params.offset || 0;
  const cacheKey = generateCacheKey(userId, params.status, limit, offset);
  const queryKey = workflowKeys.list(params);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cached = await readCache<IWorkflowResponse>(STORES.workflows, cacheKey);
      logOfflineCache('workflows cache read', {
        cacheKey,
        status: params.status,
        limit,
        offset,
        hit: !!cached,
      });
      if (!isOnline) {
        logOfflineCache('workflows offline return', { cacheKey, status: params.status });
        return (
          cached || {
            data: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false,
            },
          }
        );
      }

      const fetchAndUpdate = async () => {
        logOfflineCache('workflows fetch start', {
          cacheKey,
          status: params.status,
        });
        const response: AxiosResponse<IWorkflowResponse> =
          await getWorkflowsByStatus(params);
        await writeCache(STORES.workflows, cacheKey, response.data);
        queryClient.setQueryData(queryKey, response.data);
        logOfflineCache('workflows fetch success', {
          cacheKey,
          status: params.status,
          count: response.data?.data?.length,
        });
        return response.data;
      };

      if (cached) {
        logOfflineCache('workflows return cached', {
          cacheKey,
          status: params.status,
        });
        setTimeout(() => {
          logOfflineCache('workflows background fetch', {
            cacheKey,
            status: params.status,
          });
          fetchAndUpdate().catch((error) => {
            console.warn('[offline-cache] workflow refresh failed', error);
          });
        }, 0);
        return cached;
      }

      logOfflineCache('workflows cache miss', { cacheKey, status: params.status });
      return fetchAndUpdate();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to sync emails from Gmail
interface UseMutationSyncEmailsOptions {
  onSuccess?: (data: { success: boolean; message: string }) => void;
  onError?: (error: Error) => void;
}

export const useMutationSyncEmails = (
  options?: UseMutationSyncEmailsOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { syncEmails } = await import('../services/workflowQueries');
      const response = await syncEmails();
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate all workflow queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

// Hook to update workflow status
interface UseMutationUpdateStatusOptions {
  onSuccess?: (data: IEmailWorkflow) => void;
  onError?: (error: Error) => void;
}

export const useMutationUpdateWorkflowStatus = (
  options?: UseMutationUpdateStatusOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: WorkflowStatus }) => {
      const response = await updateWorkflowStatus(params.id, params.status);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

// Hook to snooze workflow
interface UseMutationSnoozeOptions {
  onSuccess?: (data: IEmailWorkflow) => void;
  onError?: (error: Error) => void;
}

export const useMutationSnoozeWorkflow = (
  options?: UseMutationSnoozeOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; snoozedUntil: Date }) => {
      const response = await updateWorkflowSnooze(
        params.id,
        params.snoozedUntil,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

// Hook to create or update workflow (on-demand creation)
interface UseMutationCreateOrUpdateOptions {
  onSuccess?: (data: IEmailWorkflow) => void;
  onError?: (error: Error) => void;
}

export const useMutationCreateOrUpdateWorkflow = (
  options?: UseMutationCreateOrUpdateOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      emailId: string;
      subject: string;
      from: string;
      date: string;
      snippet?: string;
      status: WorkflowStatus;
    }) => {
      const response = await createOrUpdateWorkflow(params);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};

// Hook to update workflow priority
interface UseMutationUpdatePriorityOptions {
  onSuccess?: (data: IEmailWorkflow) => void;
  onError?: (error: Error) => void;
}

export const useMutationUpdatePriority = (
  options?: UseMutationUpdatePriorityOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; priority: number }) => {
      const { updateWorkflowPriority } = await import(
        '../services/workflowQueries'
      );
      const response = await updateWorkflowPriority(params.id, params.priority);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
