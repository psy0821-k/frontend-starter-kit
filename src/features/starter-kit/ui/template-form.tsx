'use client';

import { useState, type ChangeEvent } from 'react';
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
import { uploadTemplateThumbnail } from '../lib/upload-thumbnail';
import { templateFormSchema, type TemplateFormValues } from '../model/schema';
import { STARTER_KIT_CATEGORIES } from '../model/types';
import { TemplateFileFieldArray } from './template-file-field-array';

interface TemplateFormProps {
  defaultValues: TemplateFormValues;
  onSubmit: (values: TemplateFormValues) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
}

/**
 * 템플릿 등록/수정이 공유하는 필드 UI.
 *
 * 제출 성공/실패 이후의 API 호출·라우팅은 모른다 — onSubmit이 처리한다.
 * 호출부(TemplateRegisterForm/TemplateEditForm)가 defaultValues와 onSubmit만
 * 주입하는 얇은 래퍼가 되도록, 이 컴포넌트가 필드 구성과 검증을 전담한다.
 *
 * 태그·기능·기술스택·프리뷰 이미지는 콤마 구분 문자열로 입력받습니다.
 * useAppForm이 `ZodType<T, T>`를 요구해 스키마에서 `.transform()`을 쓸 수 없기
 * 때문이며, 배열 변환은 각 래퍼의 onSubmit이 담당합니다.
 */
export function TemplateForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
}: TemplateFormProps) {
  // 제네릭을 명시한다. useAppForm의 `ZodType<T, T>`는 T가 무공변 위치에 있어
  // 추론에 맡기면 z.enum의 리터럴 유니온이 string으로 넓어지고, 그 결과
  // Control/UseFormRegister 타입이 하위 컴포넌트와 어긋난다.
  const form = useAppForm<TemplateFormValues>(templateFormSchema, { defaultValues });
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);

  const thumbnailUrl = form.watch('thumbnail_url');

  const handleThumbnailChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setThumbnailError(null);
    setIsUploadingThumbnail(true);

    try {
      const url = await uploadTemplateThumbnail(file);
      form.setValue('thumbnail_url', url, { shouldValidate: true, shouldDirty: true });
      setThumbnailFileName(file.name);
    } catch (error) {
      setThumbnailError(error instanceof ApiError ? error.message : '썸네일 업로드에 실패했습니다');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const submitForm = async (values: TemplateFormValues) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
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

  const handleFormSubmit = form.handleSubmit(submitForm);

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
        label="썸네일"
        error={errors.thumbnail_url?.message ?? thumbnailError ?? undefined}
        description="PNG, JPEG, WebP / 5MB 이하"
        required
      >
        {(accessibilityProps) => (
          <div className="flex flex-col gap-2">
            <input
              {...accessibilityProps}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={isUploadingThumbnail}
              onChange={(event) => void handleThumbnailChange(event)}
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            {isUploadingThumbnail && <p className="text-xs text-muted-foreground">업로드 중...</p>}
            {!isUploadingThumbnail && thumbnailUrl && (
              <p className="text-xs text-muted-foreground">
                {thumbnailFileName
                  ? `업로드됨: ${thumbnailFileName}`
                  : `현재 썸네일: ${thumbnailUrl}`}
              </p>
            )}
            {/* 실제 제출 값은 파일이 아니라 업로드 후 반환된 URL이다. 폼 검증 대상으로
                유지하되 사용자가 직접 입력하지 않도록 화면에서는 숨긴다. */}
            <input type="hidden" {...register('thumbnail_url')} />
          </div>
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

      <TemplateFileFieldArray
        control={control}
        register={register}
        errors={errors}
        setValue={form.setValue}
      />

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
