import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

/**
 * React Hook Form + Zod 공통 래퍼
 * 모든 폼이 일관된 설정(resolver, mode)을 사용하도록 표준화합니다.
 *
 * @example
 * const form = useAppForm(loginSchema);
 * // ← zodResolver 자동 적용, onBlur 모드 설정
 */
export function useAppForm<T extends FieldValues>(schema: ZodType<T, T>) {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });
}
