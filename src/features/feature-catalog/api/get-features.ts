import { unstable_cache } from 'next/cache';
import { createSupabasePublicClient } from '@/shared/api/supabase/public';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import type { Feature } from '../model/types';

async function fetchFeatures(): Promise<Feature[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from('features')
    .select('id, title, description, category')
    .order('updated_at', { ascending: false });

  if (error || data === null) {
    console.error('getFeatures 조회 실패', error);
    return [];
  }

  return data as Feature[];
}

const getCachedFeatures = unstable_cache(fetchFeatures, ['features-list'], {
  tags: ['features'],
  revalidate: 60,
});

/**
 * Feature 전체 목록을 조회합니다.
 *
 * 목록 카드가 쓰지 않는 summary/tags/tech_stack/usage는 조회하지 않습니다.
 * get-starter-kits.ts와 달리 mock 폴백이 없습니다 — 미설정/에러 모두 빈 배열을 반환하고,
 * 에러는 console.error로 서버 로그에만 남깁니다.
 *
 * unstable_cache로 60초간 결과를 재사용합니다(정적·소량 참조 데이터라 매 요청 DB 조회가 낭비).
 * feature 데이터 변경 시 revalidateTag('features')로 무효화합니다.
 */
export async function getFeatures(): Promise<Feature[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  return getCachedFeatures();
}
