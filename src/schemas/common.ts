import { z } from 'zod';

/**
 * 공통 필드 스키마
 * 여러 폼에서 재사용할 수 있는 검증 규칙을 정의합니다.
 */

export const commonSchema = {
  email: z.string().min(1, '이메일을 입력해주세요').email('유효한 이메일 형식이 아닙니다'),

  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '대문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),

  passwordOptional: z
    .string()
    .refine((val) => val.length === 0 || val.length >= 8, '비밀번호는 8자 이상이어야 합니다')
    .optional(),

  username: z
    .string()
    .min(2, '사용자명은 2자 이상이어야 합니다')
    .max(20, '사용자명은 20자 이하여야 합니다'),

  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '유효한 전화번호 형식이 아닙니다')
    .optional(),
};
