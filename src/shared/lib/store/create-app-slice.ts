/**
 * Zustand 슬라이스 팩토리
 * 모든 스토어 슬라이스가 공통으로 가지는 메서드를 제공합니다.
 */
export const createAppSlice =
  <T extends Record<string, unknown>>(_name: string, initialState: T) =>
  (set: (state: T & { reset: () => void }) => void) => ({
    ...initialState,
    reset: () =>
      set({
        ...initialState,
        reset: () => {},
      } as T & { reset: () => void }),
  });
