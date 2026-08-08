import Link from 'next/link';
import type { FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Controller, type Control } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { RegisterFormValues } from '@/features/auth/model/schema';

interface ConsentCheckboxGroupProps {
  control: Control<RegisterFormValues>;
  setValue: UseFormSetValue<RegisterFormValues>;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  errors: FieldErrors<RegisterFormValues>;
}

/**
 * 이용약관·개인정보처리방침 필수 동의 체크박스.
 * 전체 동의는 별도 폼 필드가 아니라 두 개별 동의값의 파생 상태로만 계산한다
 * (진실 공급원을 개별 값 2개로 고정해 동기화 버그를 구조적으로 방지).
 */
export function ConsentCheckboxGroup({
  control,
  setValue,
  agreedToTerms,
  agreedToPrivacy,
  errors,
}: ConsentCheckboxGroupProps) {
  const isAllAgreed = agreedToTerms && agreedToPrivacy;

  const handleAgreeAllChange = (checked: boolean) => {
    setValue('agreedToTerms', checked as true, { shouldValidate: true });
    setValue('agreedToPrivacy', checked as true, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Checkbox id="agree-all" checked={isAllAgreed} onCheckedChange={handleAgreeAllChange} />
        <Label htmlFor="agree-all" className="text-sm font-medium">
          전체 동의
        </Label>
      </div>

      <Controller
        control={control}
        name="agreedToTerms"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="agree-terms"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!errors.agreedToTerms}
            />
            <Label htmlFor="agree-terms" className="text-xs font-normal">
              (필수){' '}
              <Link href="/legal/terms" target="_blank" className="underline">
                이용약관
              </Link>
              에 동의합니다
            </Label>
          </div>
        )}
      />
      {errors.agreedToTerms && (
        <p role="alert" className="text-xs text-destructive">
          {errors.agreedToTerms.message}
        </p>
      )}

      <Controller
        control={control}
        name="agreedToPrivacy"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="agree-privacy"
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!errors.agreedToPrivacy}
            />
            <Label htmlFor="agree-privacy" className="text-xs font-normal">
              (필수){' '}
              <Link href="/legal/privacy" target="_blank" className="underline">
                개인정보처리방침
              </Link>
              에 동의합니다
            </Label>
          </div>
        )}
      />
      {errors.agreedToPrivacy && (
        <p role="alert" className="text-xs text-destructive">
          {errors.agreedToPrivacy.message}
        </p>
      )}
    </div>
  );
}
