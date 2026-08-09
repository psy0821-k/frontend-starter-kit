'use client';

import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/shared/ui/form-field';
import type { TemplateFormValues } from '../model/schema';
import { CodeTextarea } from './code-textarea';

interface TemplateFileFieldArrayProps {
  control: Control<TemplateFormValues>;
  register: UseFormRegister<TemplateFormValues>;
  errors: FieldErrors<TemplateFormValues>;
}

/**
 * 파일 경로 + 코드를 여러 개 입력받는 반복 필드.
 *
 * 상세 페이지의 코드 뷰어가 파일 단위로 코드를 보여주므로, 등록도 같은 단위로
 * 받습니다. 입력 순서가 그대로 표시 순서(sort_order)가 됩니다 — 파일 경로
 * 알파벳순은 "보여주고 싶은 순서"(진입점 먼저)와 다르기 때문입니다.
 */
export function TemplateFileFieldArray({ control, register, errors }: TemplateFileFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'files' });

  // 배열 자체에 걸린 에러(최소 1개, 최대 개수)는 개별 행이 아니라 여기에 표시한다.
  const filesError = typeof errors.files?.message === 'string' ? errors.files.message : undefined;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 text-sm font-medium">
        파일
        <span aria-hidden className="text-destructive">
          *
        </span>
      </legend>

      {fields.map((field, index) => {
        const fileErrors = errors.files?.[index];

        return (
          // key는 반드시 field.id를 쓴다. index를 쓰면 행 삭제 시 입력값이
          // 엉뚱한 행으로 옮겨간다.
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-end gap-2">
              <FormField
                id={`files-${index}-path`}
                label={`파일 ${index + 1} 경로`}
                error={fileErrors?.file_path?.message}
                description="예: src/features/auth/ui/login-form.tsx"
                className="flex-1"
              >
                {(accessibilityProps) => (
                  <Input
                    {...accessibilityProps}
                    placeholder="src/features/auth/ui/login-form.tsx"
                    autoComplete="off"
                    spellCheck={false}
                    {...register(`files.${index}.file_path`)}
                  />
                )}
              </FormField>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label={`파일 ${index + 1} 삭제`}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </div>

            <FormField
              id={`files-${index}-code`}
              label={`파일 ${index + 1} 코드`}
              error={fileErrors?.code?.message}
            >
              {(accessibilityProps) => (
                <CodeTextarea {...accessibilityProps} {...register(`files.${index}.code`)} />
              )}
            </FormField>
          </div>
        );
      })}

      {filesError && (
        <p role="alert" className="text-xs text-destructive">
          {filesError}
        </p>
      )}

      {/* type="button"이 없으면 클릭 시 폼이 제출된다. */}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ file_path: '', code: '' })}
        className="gap-1.5 self-start"
      >
        <PlusIcon aria-hidden />
        파일 추가
      </Button>
    </fieldset>
  );
}
