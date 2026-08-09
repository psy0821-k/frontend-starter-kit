import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import { MOCK_STARTER_KITS } from './mock-data';
import type { StarterKit } from '../model/types';

/**
 * 스타터 킷 전체 목록을 조회합니다.
 *
 * 목록 카드는 코드를 사용하지 않으므로 template_files를 조인하지 않습니다
 * (불필요한 페이로드 방지). 코드가 필요한 상세 조회는 getStarterKitById를 씁니다.
 *
 * Supabase 테이블이 아직 없는 개발 초기에는 mock 데이터로 폴백합니다.
 */
export async function getStarterKits(): Promise<StarterKit[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_STARTER_KITS;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || data === null) {
    return MOCK_STARTER_KITS;
  }

  return data as StarterKit[];
}
