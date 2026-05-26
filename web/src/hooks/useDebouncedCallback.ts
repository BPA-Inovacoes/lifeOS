import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => callbackRef.current(...args),
        delayMs
      );
    },
    [delayMs]
  );
}
