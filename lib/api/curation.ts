import { apiClient } from '@/lib/api/client';
import { CurationListRequest, CurationListResponse } from '@/types/whisky';

export async function fetchCurations(
  params: CurationListRequest = {}
): Promise<CurationListResponse['data']> {
  const { data } = await apiClient.get<CurationListResponse>('/curations', {
    params,
  });
  return data.data;
}
