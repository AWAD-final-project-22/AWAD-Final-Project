import { API_PATH } from '@/constants/apis.constant';
import { serializedParamsQuery } from '@/helpers/param.helper';
import axiosClient from '@/services/apis/apiClient';
import { AxiosResponse } from 'axios';
import {
  IWorkflowParams,
  IWorkflowResponse,
  IEmailWorkflow,
  WorkflowStatus,
} from '../interfaces/workflow.interface';

// Get workflows by status
export function getWorkflowsByStatus(
  params: IWorkflowParams,
): Promise<AxiosResponse<IWorkflowResponse>> {
  return axiosClient.get<IWorkflowResponse>(
    API_PATH.WORKFLOW.GET_WORKFLOWS.API_PATH,
    {
      params: serializedParamsQuery(params),
    },
  );
}

// Update workflow status
export function updateWorkflowStatus(
  id: string,
  status: WorkflowStatus,
): Promise<AxiosResponse<{ success: boolean; data: IEmailWorkflow }>> {
  return axiosClient.patch<{ success: boolean; data: IEmailWorkflow }>(
    API_PATH.WORKFLOW.UPDATE_STATUS.API_PATH(id),
    { status },
  );
}

// Update workflow snooze
export function updateWorkflowSnooze(
  id: string,
  snoozedUntil: Date,
): Promise<AxiosResponse<{ success: boolean; data: IEmailWorkflow }>> {
  return axiosClient.patch<{ success: boolean; data: IEmailWorkflow }>(
    API_PATH.WORKFLOW.UPDATE_SNOOZE.API_PATH(id),
    { snoozedUntil: snoozedUntil.toISOString() },
  );
}

// Create or update workflow (for on-demand creation)
export function createOrUpdateWorkflow(data: {
  emailId: string;
  subject: string;
  from: string;
  date: string;
  snippet?: string;
  status: WorkflowStatus;
}): Promise<AxiosResponse<{ success: boolean; data: IEmailWorkflow }>> {
  return axiosClient.post<{ success: boolean; data: IEmailWorkflow }>(
    API_PATH.WORKFLOW.GET_WORKFLOWS.API_PATH,
    data,
  );
}

// Update workflow priority
export function updateWorkflowPriority(
  id: string,
  priority: number,
): Promise<AxiosResponse<{ success: boolean; data: IEmailWorkflow }>> {
  return axiosClient.patch<{ success: boolean; data: IEmailWorkflow }>(
    `${API_PATH.WORKFLOW.GET_WORKFLOWS.API_PATH}/${id}/priority`,
    { priority },
  );
}
