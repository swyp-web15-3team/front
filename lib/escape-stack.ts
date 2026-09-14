// 모달/바텀시트가 겹쳐 열렸을 때 Escape가 가장 나중에 열린 오버레이만 닫도록 하는 공유 스택.
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
