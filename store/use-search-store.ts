import { create } from 'zustand';

interface SearchState {
  // 헤더 검색창을 누를 때 보이던 추천 검색어. 검색 모달 입력창의 초기값으로 쓴다
  presetKeyword: string;
  setPresetKeyword: (keyword: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  presetKeyword: '',
  setPresetKeyword: (keyword) => set({ presetKeyword: keyword }),
}));
