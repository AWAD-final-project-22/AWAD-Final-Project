export interface ISearchResult {
  id: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: string;
  snippet?: string;
  hasAttachment: boolean;
  status: string;
  aiSummary?: string;
  urgencyScore?: number;
}

export interface ISearchParams {
  query: string;
  limit?: number;
  page?: number;
}

export interface ISearchResponse {
  success: boolean;
  data: ISearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    currentPage: number;
  };
}
