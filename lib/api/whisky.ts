import { apiClient } from '@/lib/api/client';
import {
  WhiskyListRequest,
  WhiskyListResponse,
  WhiskySuggestionsRequest,
  WhiskySuggestionsResponse,
} from '@/types/whisky';

// 위스키 목록 검색
export async function fetchWhiskies(
  params: WhiskyListRequest = {}
): Promise<WhiskyListResponse['data']> {
  const { data } = await apiClient.get<WhiskyListResponse>('/whiskies', {
    params,
  });
  return data.data;
}

// 위스키 추천 검색어
export async function fetchWhiskySuggestions(
  params: WhiskySuggestionsRequest = {}
): Promise<WhiskySuggestionsResponse['data']> {
  const { data } = await apiClient.get<WhiskySuggestionsResponse>(
    '/whiskies/suggestions',
    { params }
  );
  return data.data;
}
