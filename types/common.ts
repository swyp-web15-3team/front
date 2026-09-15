export interface CursorPageResponse<T> {
  items: T[];
  nextCursor: number | null;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

// ProblemDetail(RFC 7807(최신 RFC 9457))
export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export type CountryCode = 'KR' | 'JP';
