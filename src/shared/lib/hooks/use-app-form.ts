import { useForm, type DefaultValues, type FieldValues, type Mode } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

interface UseAppFormOptions<T extends FieldValues> {
  mode?: Mode;
  defaultValues?: DefaultValues<T>;
}

/**
 * React Hook Form + Zod 공통 래퍼
 * 모든 폼이 일관된 설정(resolver, mode)을 사용하도록 표준화합니다.
 * mode를 생략하면 기존과 동일하게 onBlur로 동작합니다.
 *
 * defaultValues는 특히 boolean 필드(체크박스 등)에서 필수입니다 — 값이
 * undefined인 채로 첫 렌더링되면 RHF/Base UI Checkbox가 uncontrolled로
 * 시작했다가 이후 controlled로 전환되며 상태 반영이 깨집니다.
 *
 * @example
 * const form = useAppForm(loginSchema);
 * // ← zodResolver 자동 적용, onBlur 모드 설정
 *
 * @example
 * const form = useAppForm(registerSchema, { mode: 'onChange' });
 * // ← 비밀번호 실시간 검증처럼 즉시 피드백이 필요한 폼
 */
export function useAppForm<T extends FieldValues>(
  schema: ZodType<T, T>,
  options?: UseAppFormOptions<T>
) {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: options?.mode ?? 'onBlur',
    defaultValues: options?.defaultValues,
  });
}
