export interface CursorPageResponse<T> {
  items: T[];
  nextCursor: number | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type CountryCode = 'KR' | 'JP';
