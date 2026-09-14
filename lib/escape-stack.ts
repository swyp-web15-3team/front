// 모달/바텀시트가 겹쳐 열렸을 때 Escape가 가장 나중에 열린 오버레이만 닫도록 하는 공유 스택.
//
// 새 esc 리스너 추가 시 규칙:
// - 기본: document.addEventListener('keydown', ...) 에 등록 + pushEscapeLayer()/isTopLayer() 조합을 그대로 따른다.
//   (document 레벨끼리는 버블링 경로가 없어 stopPropagation 불필요)
// - 부득이하게 패널 등 특정 DOM 노드에 onKeyDown으로 걸어야 한다면, 반드시 stopPropagation()을 호출해
//   상위(document 리스너 등)로 전파되어 중복 처리되는 것을 막는다.
const stack: symbol[] = [];

export function pushEscapeLayer() {
  const id = Symbol();
  stack.push(id);
  return {
    isTopLayer: () => stack[stack.length - 1] === id,
    pop: () => {
      const index = stack.indexOf(id);
      if (index !== -1) stack.splice(index, 1);
    },
  };
}

// 테스트에서 cleanup 누락으로 잔여 레이어가 다음 테스트로 새는 것을 막기 위한 리셋.
export function resetEscapeStack() {
  stack.length = 0;
}
