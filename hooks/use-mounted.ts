import { useSyncExternalStore } from 'react';

// 구독할 외부 변화가 없다(마운트 여부는 한 번 정해지면 안 바뀐다).
const noopSubscribe = () => () => {};

/**
 * 클라이언트에 마운트됐는지 여부. SSR에서는 false, 브라우저에서는 true다.
 *
 * `useState` + `useEffect(() => setMounted(true))` 패턴 대신 이걸 쓴다.
 * effect 안에서 동기적으로 setState하면 연쇄 렌더가 발생하고, ESLint의
 * react-hooks 규칙도 이를 막는다. (use-media-query.ts와 같은 방식)
 *
 * 용도: document/window가 필요한 포탈처럼 SSR에서 렌더할 수 없는 것.
 */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
