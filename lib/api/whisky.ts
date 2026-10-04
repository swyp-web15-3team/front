import { apiClient } from '@/lib/api/client';
import {
  WhiskyCategoryListResponse,
  WhiskyDetailResponse,
  WhiskyListRequest,
  WhiskyListResponse,
  WhiskyRelatedListResponse,
  WhiskySuggestionsRequest,
  WhiskySuggestionsResponse,
} from '@/types/whisky';

// 위스키 목록 검색
export async function fetchWhiskies(
  params: WhiskyListRequest = {}
): Promise<WhiskyListResponse['data']> {
  const { data } = await apiClient.get<WhiskyListResponse>('/whiskies', {
    params,
    // 배열은 categoryId[]=1이 아니라 categoryId=1&categoryId=2로 보낸다
    paramsSerializer: { indexes: null },
  });
  return data.data;
}

// 위스키 종류 (검색 필터의 "종류" 옵션)
export async function fetchWhiskyCategories(): Promise<
  WhiskyCategoryListResponse['data']
> {
  const { data } =
    await apiClient.get<WhiskyCategoryListResponse>('/whisky-categories');
  return data.data;
}

// 위스키 상세 (판매처 목록 포함)
export async function fetchWhiskyDetail(
  whiskyId: number
): Promise<WhiskyDetailResponse['data']> {
  const { data } = await apiClient.get<WhiskyDetailResponse>(
    `/whiskies/${whiskyId}`
  );
  return data.data;
}

// 연관 위스키 목록
export async function fetchRelatedWhiskies(
  whiskyId: number
): Promise<WhiskyRelatedListResponse['data']> {
  const { data } = await apiClient.get<WhiskyRelatedListResponse>(
    `/whiskies/${whiskyId}/related`
  );
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
