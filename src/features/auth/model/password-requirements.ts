export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

/**
 * password-requirement-list.tsx가 그대로 순회하며 렌더링하는 체크리스트 정의.
 * schema.ts의 passwordSchema 규칙과 동일한 기준을 사람이 읽을 수 있는 형태로 나열한다.
 */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: '8자 이상',
    test: (password) => password.length >= 8,
  },
  {
    id: 'letter',
    label: '영문 포함',
    test: (password) => /[a-zA-Z]/.test(password),
  },
  {
    id: 'number',
    label: '숫자 포함',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: '특수문자 포함',
    test: (password) => /[^a-zA-Z0-9]/.test(password),
  },
];
