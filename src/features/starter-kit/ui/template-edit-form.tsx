'use client';

import { useRouter } from 'next/navigation';
import { updateTemplate } from '../api/update-template';
import { toCreateTemplateInput } from '../lib/to-create-input';
import type { TemplateFormValues } from '../model/schema';
import { TemplateForm } from './template-form';

interface TemplateEditFormProps {
  templateId: string;
  defaultValues: TemplateFormValues;
}

/**
 * 템플릿 수정 화면. TemplateForm에 수정 전용 정책(기존값 프리필,
 * updateTemplate 호출, 완료 후 상세 페이지 이동)을 주입하는 얇은 래퍼.
 */
export function TemplateEditForm({ templateId, defaultValues }: TemplateEditFormProps) {
  const router = useRouter();

  const handleSubmit = async (values: TemplateFormValues) => {
    const id = await updateTemplate(templateId, toCreateTemplateInput(values));
    router.push(`/templates/${id}`);
  };

  return (
    <TemplateForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel="수정하기"
      submittingLabel="수정 중..."
    />
  );
}
