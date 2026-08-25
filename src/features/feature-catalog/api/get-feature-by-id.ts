import { cache } from 'react';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import type { FeatureDetail, FeatureFile } from '../model/types';

type FeatureRow = Omit<FeatureDetail, 'files'> & {
  feature_files: FeatureFile[] | null;
};

/**
 * Feature 단건을 파일 목록과 함께 조회합니다.
 *
 * PostgREST 임베딩으로 단일 요청이므로 N+1이 발생하지 않습니다.
 * get-features.ts와 동일하게 mock 폴백이 없습니다 — 미설정/에러 모두 null을 반환하고,
 * 에러는 console.error로 서버 로그에만 남깁니다.
 *
 * generateMetadata와 페이지 컴포넌트가 같은 요청 안에서 동일 id로 이 함수를 각각
 * 호출하므로, React.cache로 요청 단위 중복 조회를 제거합니다.
 */
export const getFeatureById = cache(async (id: string): Promise<FeatureDetail | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('features')
    .select('*, feature_files(file_path, code, language, sort_order)')
    .eq('id', id)
    .maybeSingle<FeatureRow>();

  if (error) {
    console.error('getFeatureById 조회 실패', error);
    return null;
  }

  if (data === null) {
    return null;
  }

  const { feature_files, ...feature } = data;
  return { ...feature, files: feature_files ?? [] };
});
