/**
 * 스타터 카탈로그 도메인 타입.
 * DB 테이블이 아니라 정적 상수 배열(`starters.ts`)로 관리되므로
 * 필드는 화면에 필요한 최소한만 둡니다.
 */
export interface Starter {
  slug: string;
  title: string;
  summary: string;
  category: string;
}
