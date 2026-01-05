import { API_PATH } from '@/constants/apis.constant';
import { serializedParamsQuery } from '@/helpers/param.helper';
import axiosClient from '@/services/apis/apiClient';
import { AxiosResponse } from 'axios';
import {
  SuggestionsParams,
  SuggestionsResponse,
} from '../interfaces/suggestions.interface';

export function getSuggestions(
  params: SuggestionsParams,
): Promise<AxiosResponse<SuggestionsResponse>> {
  return axiosClient.get<SuggestionsResponse>(
    API_PATH.WORKFLOW.SUGGESTIONS.API_PATH,
    { params: serializedParamsQuery(params) },
  );
}
