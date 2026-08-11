import { describe, expect, it } from 'vitest';
import { registerSchema } from './schema';

const validInput = {
  name: '홍길동',
  email: 'user@example.com',
  password: 'abc12345!',
  passwordConfirm: 'abc12345!',
  nickname: '닉네임',
  agreedToTerms: true,
  agreedToPrivacy: true,
};

describe('registerSchema', () => {
  it('name이 공백만 있으면 실패한다', () => {
    const result = registerSchema.safeParse({ ...validInput, name: '   ' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    }
  });

  it('password가 7자 이하면 실패한다', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'ab12!cd',
      passwordConfirm: 'ab12!cd',
    });

    expect(result.success).toBe(false);
  });

  it('password에 특수문자가 없으면 실패한다', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'abcd1234',
      passwordConfirm: 'abcd1234',
    });

    expect(result.success).toBe(false);
  });

  it('password와 passwordConfirm이 다르면 실패한다', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      passwordConfirm: 'different1!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'passwordConfirm')).toBe(true);
    }
  });

  it('nickname이 2자 미만이면 실패한다', () => {
    const result = registerSchema.safeParse({ ...validInput, nickname: '가' });

    expect(result.success).toBe(false);
  });

  it('nickname이 20자를 초과하면 실패한다', () => {
    const result = registerSchema.safeParse({ ...validInput, nickname: '가'.repeat(21) });

    expect(result.success).toBe(false);
  });

  it('agreedToTerms가 false이면 실패한다', () => {
    const result = registerSchema.safeParse({ ...validInput, agreedToTerms: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'agreedToTerms')).toBe(true);
    }
  });

  it('agreedToPrivacy가 false이면 실패한다', () => {
    const result = registerSchema.safeParse({ ...validInput, agreedToPrivacy: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'agreedToPrivacy')).toBe(true);
    }
  });

  it('모든 필드가 유효하면 성공하고 birthDate 키를 포함하지 않는다', () => {
    const result = registerSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('birthDate');
    }
  });
});
