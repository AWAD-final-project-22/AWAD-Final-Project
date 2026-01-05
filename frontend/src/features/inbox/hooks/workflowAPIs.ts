import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: workflowKeys.list(params),
    queryFn: async () => {
      const response: AxiosResponse<IWorkflowResponse> =
        await getWorkflowsByStatus(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
