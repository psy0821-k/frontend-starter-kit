import { useEffect, useState } from 'react';

/**
 * 값이 delay(ms) 동안 변하지 않을 때만 최신 값을 반환하는 디바운스 훅.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
