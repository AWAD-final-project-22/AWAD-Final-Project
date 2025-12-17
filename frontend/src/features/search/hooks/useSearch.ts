'use client';

import { useQuery } from '@tanstack/react-query';
import { API_PATH } from '@/constants/apis.constant';
import { searchWorkflows } from '../services/searchQueries';
import { ISearchParams } from '../interfaces/search.interface';

export const useSearchWorkflows = (
  params: ISearchParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [API_PATH.WORKFLOW.SEARCH_WORKFLOWS.API_KEY, params],
    queryFn: async () => {
      const response = await searchWorkflows(params);
      return response.data;
    },
    enabled: enabled && !!params.query && params.query.trim().length > 0,
    staleTime: 30000,
  });
};
