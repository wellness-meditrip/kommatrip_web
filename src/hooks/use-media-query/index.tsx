import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void, query: string): () => void {
  const media = globalThis.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

/**
 * 미디어 쿼리 매칭 여부를 반환합니다.
 *
 * useSyncExternalStore를 사용해 React 19의 concurrent 렌더링에서
 * tearing 없이 안전하게 동작하며, SSR hydration 불일치를 방지합니다.
 *
 * SSR / 첫 hydration에서는 항상 false(모바일 기준)를 반환하고,
 * 클라이언트 마운트 후 실제 viewport 값으로 업데이트됩니다.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(callback, query),
    () => globalThis.matchMedia(query).matches,
    () => false
  );
}
