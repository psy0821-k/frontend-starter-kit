import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import type { Feature } from '../model/types';

/**
 * Feature 전체 목록을 조회합니다.
 *
 * 목록 카드가 쓰지 않는 summary/tags/tech_stack/usage는 조회하지 않습니다.
 * get-starter-kits.ts와 달리 mock 폴백이 없습니다 — 미설정/에러 모두 빈 배열을 반환하고,
 * 에러는 console.error로 서버 로그에만 남깁니다.
 */
export async function getFeatures(): Promise<Feature[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();

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
