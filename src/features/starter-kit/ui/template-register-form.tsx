'use client';

import { useRouter } from 'next/navigation';
import { createTemplate } from '../api/create-template';
import { toCreateTemplateInput } from '../lib/to-create-input';
import type { TemplateFormValues } from '../model/schema';
import { TemplateForm } from './template-form';

const EMPTY_DEFAULT_VALUES: TemplateFormValues = {
  title: '',
  summary: '',
  category: 'erp',
  description: '',
  thumbnail_url: '',
  tags: '',
  features: '',
  tech_stack: '',
  preview_images: '',
  files: [{ file_path: '', code: '', is_entry: false }],
};

/**
 * 템플릿 등록 화면. TemplateForm에 등록 전용 정책(빈 초기값, createTemplate
 * 호출, 완료 후 상세 페이지 이동)을 주입하는 얇은 래퍼.
 */
export function TemplateRegisterForm() {
  const router = useRouter();

  const handleSubmit = async (values: TemplateFormValues) => {
    const id = await createTemplate(toCreateTemplateInput(values));
    router.push(`/templates/${id}`);
  };

  return (
    <TemplateForm
      defaultValues={EMPTY_DEFAULT_VALUES}
      onSubmit={handleSubmit}
      submitLabel="등록하기"
      submittingLabel="등록 중..."
    />
  );
}
