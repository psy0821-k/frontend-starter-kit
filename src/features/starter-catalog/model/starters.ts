import type { Starter } from './types';

/**
 * 스타터 카탈로그. 스타터는 DB 엔티티가 아니라 코드에 고정된 정적 목록입니다
 * (3개 이상으로 늘어나면 재검토 — PRD Out of Scope 참고).
 */
export const STARTERS: Starter[] = [
  {
    slug: 'portfolio',
    title: '포트폴리오 스타터',
    summary: '터미널 컨셉의 개발자 포트폴리오 랜딩 페이지',
    category: '포트폴리오',
  },
  {
    slug: 'erp',
    title: 'ERP 스타터',
    summary: '조경·원예 자재 B2B 유통사를 위한 영업관리 대시보드',
    category: 'ERP',
  },
];
