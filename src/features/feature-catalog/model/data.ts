import type { Feature } from './types';

/**
 * 정적 Feature 목록.
 * DB 테이블(`features`)이 아직 없어 코드 상수로 관리합니다.
 * 실제 연동 시 `api/get-features.ts`를 추가해 이 배열을 대체합니다.
 */
export const FEATURES: Feature[] = [
  {
    id: 'search',
    title: '검색',
    description: '전체 콘텐츠를 빠르게 찾을 수 있는 통합 검색 기능입니다.',
    category: 'search',
  },
  {
    id: 'filter-search',
    title: '필터 검색',
    description: '조건을 조합해 원하는 항목만 좁혀서 찾는 고급 검색 기능입니다.',
    category: 'search',
  },
  {
    id: 'board',
    title: '게시판',
    description: '글 작성·조회·수정·삭제가 가능한 기본 게시판 기능입니다.',
    category: 'board',
  },
  {
    id: 'board-pagination',
    title: '게시판 페이지네이션',
    description: '게시글 목록을 페이지 단위로 나눠 보여주는 기능입니다.',
    category: 'board',
  },
  {
    id: 'comment',
    title: '댓글',
    description: '게시글이나 콘텐츠에 댓글을 작성하고 대댓글을 달 수 있는 기능입니다.',
    category: 'comment',
  },
  {
    id: 'payment',
    title: '결제',
    description: '외부 PG사와 연동해 상품이나 서비스를 결제하는 기능입니다.',
    category: 'payment',
  },
  {
    id: 'payment-history',
    title: '결제 내역 조회',
    description: '과거 결제 이력을 조회하고 영수증을 확인하는 기능입니다.',
    category: 'payment',
  },
  {
    id: 'notification',
    title: '알림',
    description: '실시간 이벤트를 사용자에게 알려주는 알림 기능입니다.',
    category: 'notification',
  },
];
