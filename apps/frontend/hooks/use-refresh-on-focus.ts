/**
 * useRefreshOnFocus
 * 
 * Re-fetches data when:
 *  1. The component first mounts
 *  2. The browser tab regains focus (user navigated away and back)
 *  3. A custom 'data-mutated' event is dispatched (from any mutation on any page)
 *
 * This replaces the broken `router.refresh()` pattern for client components.
 */
import { useEffect, useCallback, useRef } from 'react';

export function useRefreshOnFocus(fetchFn: () => Promise<void> | void) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const stableFetch = useCallback(() => {
    fetchRef.current();
  }, []);

  useEffect(() => {
    // Initial fetch
    stableFetch();

    // Re-fetch when tab regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        stableFetch();
      }
    };

    // Re-fetch when any page dispatches a mutation event
    const handleDataMutated = () => {
      stableFetch();
    };

    window.addEventListener('focus', stableFetch);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('data-mutated', handleDataMutated);

    return () => {
      window.removeEventListener('focus', stableFetch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('data-mutated', handleDataMutated);
    };
  }, [stableFetch]);
}

/**
 * Call this after any successful mutation (create, update, delete)
 * to notify all mounted pages to re-fetch their data.
 */
export function notifyDataMutated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('data-mutated'));
  }
}
