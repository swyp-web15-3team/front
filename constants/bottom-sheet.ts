export const BOTTOM_SHEET_ID = {
  SAVE_ITEM: 'save-item',
} as const;

export type BottomSheetId =
  (typeof BOTTOM_SHEET_ID)[keyof typeof BOTTOM_SHEET_ID];
