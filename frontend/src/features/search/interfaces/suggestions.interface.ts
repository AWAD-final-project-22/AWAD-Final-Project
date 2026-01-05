export interface SuggestionItem {
  text: string;
  type: 'sender' | 'subject';
  count: number;
}

export interface SuggestionsParams {
  q: string;
  limit?: number;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: SuggestionItem[];
}
