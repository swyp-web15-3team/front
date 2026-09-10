export interface CursorPageResponse<T> {
  items: T[];
  nextCursor: number | null;
}
