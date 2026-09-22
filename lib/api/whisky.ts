import { apiClient } from '@/lib/api/client';
import {
  WhiskySuggestionsRequest,
  WhiskySuggestionsResponse,
} from '@/types/whisky';

export async function fetchWhiskySuggestions(
  params: WhiskySuggestionsRequest = {}
): Promise<WhiskySuggestionsResponse['data']> {
  const { data } = await apiClient.get<WhiskySuggestionsResponse>(
    '/api/v1/whiskies/suggestions',
    { params }
  );
  return data.data;
}
