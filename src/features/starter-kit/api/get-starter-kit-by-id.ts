import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { isSupabaseConfigured } from '@/shared/api/supabase/config';
import { MOCK_STARTER_KITS } from './mock-data';
import type { StarterKit, TemplateFile } from '../model/types';

/**
 * Supabase 조회 결과. template_files는 임베딩되어 배열로 딸려옵니다.
 * DB 컬럼과 도메인 타입이 1:1이라 별도 매핑 없이 그대로 사용합니다.
 */
type TemplateRow = Omit<StarterKit, 'files'> & {
  template_files: TemplateFile[] | null;
};

/**
 * 스타터 킷 단건을 파일 목록과 함께 조회합니다.
 *
 * PostgREST 임베딩으로 단일 요청이므로 N+1이 발생하지 않습니다.
 * 찾지 못하면 null을 반환하고, 호출부(상세 페이지)가 notFound()를 호출합니다.
 *
 * Supabase 테이블이 아직 없는 개발 초기에는 mock 데이터로 폴백합니다 —
 * 스키마 적용 전에도 상세 페이지 UI를 확인할 수 있어야 하기 때문입니다.
 */
export async function getStarterKitById(id: string): Promise<StarterKit | null> {
  if (!isSupabaseConfigured()) {
    return findMockStarterKitById(id);
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*, template_files(file_path, code, language, sort_order, is_entry)')
    .eq('id', id)
    .maybeSingle<TemplateRow>();

  if (error) {
    return findMockStarterKitById(id);
  }

  if (data === null) {
    return null;
  }

  const { template_files, ...template } = data;
  return { ...template, files: template_files ?? [] };
}

function findMockStarterKitById(id: string): StarterKit | null {
  return MOCK_STARTER_KITS.find((starterKit) => starterKit.id === id) ?? null;
}
