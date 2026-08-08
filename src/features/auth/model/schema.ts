import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 20;

/**
 * 비밀번호 정책: 8자 이상 + 영문/숫자/특수문자 모두 포함.
 * password-requirement-list.tsx의 체크리스트 항목과 1:1로 대응한다.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, '8자 이상 입력해주세요')
  .regex(/[a-zA-Z]/, '영문을 포함해주세요')
  .regex(/[0-9]/, '숫자를 포함해주세요')
  .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해주세요');

export const nicknameSchema = z
  .string()
  .min(NICKNAME_MIN_LENGTH, `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다`)
  .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다`);

export const nameSchema = z.string().trim().min(1, '이름을 입력해주세요');

/**
 * boolean으로 받되(체크박스 미체크 상태를 표현하려면 false가 필요) refine으로
 * true만 통과시킨다. z.literal(true)는 폼의 boolean 기본값(false)과 타입이
 * 충돌해 RHF defaultValues/Controller 제네릭이 깨지므로 사용하지 않는다.
 */
const requiredAgreementSchema = (message: string) =>
  z.boolean().refine((value) => value === true, { message });

export const registerSchema = z
  .object({
    email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, '비밀번호를 다시 입력해주세요'),
    nickname: nicknameSchema,
    name: nameSchema,
    agreedToTerms: requiredAgreementSchema('이용약관에 동의해주세요'),
    agreedToPrivacy: requiredAgreementSchema('개인정보처리방침에 동의해주세요'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * 로그인은 형식 검증만 수행한다. 실제 자격 증명(이메일/비밀번호 일치 여부)은
 * 서버 응답으로만 판단하며, 클라이언트 스키마에서 비밀번호 정책(길이/조합)을
 * 강제하지 않는다 — 과거에 등록된 계정은 현재의 passwordSchema 정책보다 느슨한
 * 비밀번호를 갖고 있을 수 있기 때문이다.
 */
export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
