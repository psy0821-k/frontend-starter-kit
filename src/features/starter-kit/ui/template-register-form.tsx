'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/shared/ui/form-field';
import { ApiError } from '@/shared/api/error';
import { useAppForm } from '@/shared/lib/hooks/use-app-form';
import { createTemplate } from '../api/create-template';
import { toCreateTemplateInput } from '../lib/to-create-input';
import { templateFormSchema, type TemplateFormValues } from '../model/schema';
import { STARTER_KIT_CATEGORIES } from '../model/types';
import { TemplateFileFieldArray } from './template-file-field-array';

/**
 * 템플릿 등록 폼.
 *
 * 태그·기능·기술스택·프리뷰 이미지는 콤마 구분 문자열로 입력받습니다.
 * useAppForm이 `ZodType<T, T>`를 요구해 스키마에서 `.transform()`을 쓸 수 없기
 * 때문이며, 배열 변환은 제출 직전 toCreateTemplateInput이 담당합니다.
 */
export function TemplateRegisterForm() {
  const router = useRouter();
  // 제네릭을 명시한다. useAppForm의 `ZodType<T, T>`는 T가 무공변 위치에 있어
  // 추론에 맡기면 z.enum의 리터럴 유니온이 string으로 넓어지고, 그 결과
  // Control/UseFormRegister 타입이 하위 컴포넌트와 어긋난다.
  const form = useAppForm<TemplateFormValues>(templateFormSchema, {
    defaultValues: {
      title: '',
      summary: '',
      category: 'erp',
      description: '',
      thumbnail_url: '',
      tags: '',
      features: '',
      tech_stack: '',
      preview_images: '',
      files: [{ file_path: '', code: '' }],
    },
  });
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitTemplate = async (values: TemplateFormValues) => {
    setSubmitError(null);

    try {
      const id = await createTemplate(toCreateTemplateInput(values));
      router.push(`/templates/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(
          error.code === 'CONFLICT' ? '이미 등록된 파일 경로가 있습니다' : error.message
        );
        return;
      }
      throw error;
    }
  };

  const handleFormSubmit = form.handleSubmit(submitTemplate);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void handleFormSubmit(e);
      }}
      className="flex flex-col gap-5"
    >
      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <FormField id="title" label="제목" error={errors.title?.message} required>
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="Next.js SaaS Starter"
            {...register('title')}
          />
        )}
      </FormField>

      <FormField
        id="summary"
        label="한 줄 요약"
        error={errors.summary?.message}
        description="목록 카드에 표시됩니다"
        required
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="결제와 인증이 포함된 SaaS 랜딩 스타터"
            {...register('summary')}
          />
        )}
      </FormField>

      <FormField id="category" label="카테고리" error={errors.category?.message} required>
        {(accessibilityProps) => (
          // Base UI Select는 네이티브 input이 아니라 register로 연결할 수 없어
          // Controller로 값과 변경 이벤트를 잇는다.
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={accessibilityProps.id}
                  aria-invalid={accessibilityProps['aria-invalid']}
                  aria-describedby={accessibilityProps['aria-describedby']}
                  onBlur={field.onBlur}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STARTER_KIT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormField>

      <FormField id="description" label="설명" error={errors.description?.message} required>
        {(accessibilityProps) => (
          <Textarea
            {...accessibilityProps}
            rows={4}
            placeholder="이 스타터가 무엇을 제공하는지 설명해주세요"
            {...register('description')}
          />
        )}
      </FormField>

      <FormField
        id="thumbnail_url"
        label="썸네일 경로"
        error={errors.thumbnail_url?.message}
        description="/로 시작하는 경로 또는 http(s):// URL"
        required
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="/mock/starter-kits/saas-starter.png"
            autoComplete="off"
            {...register('thumbnail_url')}
          />
        )}
      </FormField>

      <FormField
        id="preview_images"
        label="미리보기 이미지"
        error={errors.preview_images?.message}
        description="쉼표로 구분해 여러 개를 입력할 수 있습니다 (선택)"
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="/mock/a.png, /mock/b.png"
            autoComplete="off"
            {...register('preview_images')}
          />
        )}
      </FormField>

      <FormField
        id="tags"
        label="태그"
        error={errors.tags?.message}
        description="쉼표로 구분해주세요"
        required
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="Next.js, Tailwind, Stripe"
            autoComplete="off"
            {...register('tags')}
          />
        )}
      </FormField>

      <FormField
        id="features"
        label="주요 기능"
        error={errors.features?.message}
        description="쉼표로 구분해주세요"
        required
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="소셜 로그인, 구독 결제, 반응형 랜딩"
            autoComplete="off"
            {...register('features')}
          />
        )}
      </FormField>

      <FormField
        id="tech_stack"
        label="사용 기술"
        error={errors.tech_stack?.message}
        description="쉼표로 구분해주세요"
        required
      >
        {(accessibilityProps) => (
          <Input
            {...accessibilityProps}
            placeholder="Next.js, TypeScript, Tailwind CSS"
            autoComplete="off"
            {...register('tech_stack')}
          />
        )}
      </FormField>

      <TemplateFileFieldArray control={control} register={register} errors={errors} />

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? '등록 중...' : '등록하기'}
      </Button>
    </form>
  );
}
