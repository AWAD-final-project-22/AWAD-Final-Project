import { API_PATH } from '@/constants/apis.constant';
import { serializedParamsQuery } from '@/helpers/param.helper';
import axiosClient from '@/services/apis/apiClient';
import { AxiosResponse } from 'axios';
import { ISearchParams, ISearchResponse } from '../interfaces/search.interface';

export function searchWorkflows(
  params: ISearchParams,
): Promise<AxiosResponse<ISearchResponse>> {
  return axiosClient.get<ISearchResponse>(
    API_PATH.WORKFLOW.SEARCH_WORKFLOWS.API_PATH,
    { params: serializedParamsQuery(params) },
  );
}
