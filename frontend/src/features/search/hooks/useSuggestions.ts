'use client';

import { useQuery } from '@tanstack/react-query';
import { API_PATH } from '@/constants/apis.constant';
import { getSuggestions } from '../services/suggestionsQueries';
import { SuggestionsParams } from '../interfaces/suggestions.interface';

export const useSuggestions = (params: SuggestionsParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: [API_PATH.WORKFLOW.SUGGESTIONS.API_KEY, params],
    queryFn: async () => {
      const response = await getSuggestions(params);
      return response.data;
    },
    enabled: enabled && !!params.q && params.q.trim().length > 0,
    staleTime: 60000, // Cache 1 phút
  });
};
