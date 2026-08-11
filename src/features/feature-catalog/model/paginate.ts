export const FEATURES_PER_PAGE = 6;

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
}

/**
 * URL 쿼리스트링(`?page=`)의 값을 유효한 페이지 번호로 파싱합니다.
 * 숫자가 아니거나 1보다 작으면 1로 폴백합니다. 상한 보정은 `paginate`가 담당합니다.
 */
export function toValidPage(value: string | undefined): number {
  const parsed = Number(value);

  return !Number.isInteger(parsed) || parsed < 1 ? 1 : parsed;
}

/**
 * 목록을 페이지당 `FEATURES_PER_PAGE`개씩 나눠 현재 페이지 구간만 반환합니다.
 */
export function paginate<T>(items: T[], page: number): PaginationResult<T> {
  const totalPages = Math.max(Math.ceil(items.length / FEATURES_PER_PAGE), 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * FEATURES_PER_PAGE;

  return {
    items: items.slice(start, start + FEATURES_PER_PAGE),
    currentPage,
    totalPages,
  };
}
