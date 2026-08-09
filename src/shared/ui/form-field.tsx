import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/shared/lib/cn';

interface FieldAccessibilityProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  /** RHF의 `errors.foo?.message`를 그대로 넘깁니다. */
  error?: string;
  /** 입력 형식 안내 등 보조 설명. */
  description?: string;
  required?: boolean;
  className?: string;
  children: (accessibilityProps: FieldAccessibilityProps) => ReactNode;
}

/**
 * 라벨·에러·설명과 입력 컨트롤의 접근성 연결을 자동화하는 폼 필드 래퍼.
 *
 * 주입하는 정책:
 * 1. `htmlFor` ↔ `id` 연결
 * 2. 에러 시 `aria-invalid` 자동 부여
 * 3. `aria-describedby`를 에러/설명 id로 자동 계산(둘 다 있으면 공백으로 결합)
 * 4. 에러 메시지에 `role="alert"`와 `{id}-error` 네이밍 규약 적용
 * 5. 필드 레이아웃(`flex flex-col gap-1.5`) 통일
 * 6. 필수 표시(`*` + `aria-hidden`) 통일
 *
 * 컨트롤 종류에 의존하지 않도록 render-prop을 씁니다 — Input, Textarea, Select,
 * PasswordInput을 모두 감쌀 수 있고 `{...register()}`의 스프레드 순서를 호출부가
 * 통제할 수 있습니다. `as`/`component` prop 방식은 제네릭이 무너져 any가 필요해집니다.
 *
 * react-hook-form에 의존하지 않고 `error: string`만 받으므로 shared가 폼
 * 라이브러리를 알 필요가 없습니다.
 *
 * @example
 * <FormField id="title" label="제목" error={errors.title?.message} required>
 *   {(field) => <Input {...field} {...register('title')} />}
 * </FormField>
 */
export function FormField({
  id,
  label,
  error,
  description,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </Label>

      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
