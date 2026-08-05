import { MOCK_STARTER_KITS } from './mock-data';
import type { StarterKit } from '../model/types';

/**
 * 스타터 킷 전체 목록을 조회합니다.
 * 현재는 정적 mock 데이터를 반환하지만, 추후 Supabase 클라이언트 호출로
 * 내부 구현만 교체하면 호출부(컴포넌트, 훅)는 변경할 필요가 없습니다.
 */
export async function getStarterKits(): Promise<StarterKit[]> {
  return MOCK_STARTER_KITS;
}
