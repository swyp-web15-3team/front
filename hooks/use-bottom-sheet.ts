import type { BottomSheetId } from '@/constants/bottom-sheet';
import { useBottomSheetStore } from '@/store/use-bottom-sheet-store';

/**
 * 바텀시트 open/close 상태만 관리하는 훅. useModal과 동일한 형태이지만
 * 별도 스토어(useBottomSheetStore)를 써서 모달과 독립적으로 열고 닫을 수 있다
 * (예: 바텀시트 위에 모달을 띄우는 경우).
 * 바텀시트끼리는 한 번에 하나만 열린다(단일 바텀시트 정책).
 *
 * 사용법
 * 1. constants/bottom-sheet.ts의 BOTTOM_SHEET_ID에 새 id를 추가한다.
 * 2. 바텀시트 컴포넌트에서 useBottomSheet<TPayload>(BOTTOM_SHEET_ID.XXX)로 isOpen/payload/open/close를 받는다.
 * 3. isOpen/close를 components/ui/BottomSheet에 그대로 넘기고, children으로 내용을 채운다.
 * 4. open(payload)로 연 시점의 데이터를 넘기고, payload로 꺼내 쓴다(닫히면 null).
 */
export function useBottomSheet<TPayload = undefined>(
  bottomSheetId: BottomSheetId
) {
  const activeBottomSheet = useBottomSheetStore(
    (state) => state.activeBottomSheet
  );
  const payload = useBottomSheetStore((state) => state.payload);
  const open = useBottomSheetStore((state) => state.open);
  const close = useBottomSheetStore((state) => state.close);
  const isOpen = activeBottomSheet === bottomSheetId;

  return {
    isOpen,
    payload: isOpen ? (payload as TPayload) : null,
    open: (openPayload?: TPayload) => open(bottomSheetId, openPayload),
    close: () => close(bottomSheetId),
  };
}
