import { unstable_cache } from 'next/cache';
import { createSupabasePublicClient } from '@/shared/api/supabase/public';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import { MOCK_STARTER_KITS } from './mock-data';
import type { StarterKit } from '../model/types';

async function fetchStarterKits(): Promise<StarterKit[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || data === null) {
    return MOCK_STARTER_KITS;
  }

  return data as StarterKit[];
}

const getCachedStarterKits = unstable_cache(fetchStarterKits, ['starter-kits-list'], {
  tags: ['templates'],
  revalidate: 60,
});

/**
 * 스타터 킷 전체 목록을 조회합니다.
 *
 * 목록 카드는 코드를 사용하지 않으므로 template_files를 조인하지 않습니다
 * (불필요한 페이로드 방지). 코드가 필요한 상세 조회는 getStarterKitById를 씁니다.
 *
 * 여러 사용자가 공유하는 참조 데이터라 unstable_cache로 60초간 재사용합니다.
 * 관리자 CRUD 시 revalidateTag('templates')로 무효화합니다
 * (src/app/api/templates/route.ts, src/app/api/templates/[id]/route.ts).
 *
 * 캐시 스코프 안에서는 cookies()를 호출할 수 없어 쿠키 없는 public 클라이언트를 씁니다.
 * 목록은 공개 데이터라 익명 권한으로 충분합니다.
 *
 * Supabase 테이블이 아직 없는 개발 초기에는 mock 데이터로 폴백합니다.
 */
export async function getStarterKits(): Promise<StarterKit[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_STARTER_KITS;
  }

  return getCachedStarterKits();
}
