'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/shared/ui/password-input';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { useAppForm } from '@/shared/lib/hooks/use-app-form';
import { loginSchema, type LoginFormValues } from '@/features/auth/model/schema';

/**
 * 이메일 로그인 폼.
 * mode를 생략해 기존 useAppForm 기본값(onBlur)을 그대로 사용한다 — 로그인은
 * 이미 정해진 값을 입력하는 행위라 회원가입과 달리 타이핑 중 실시간 피드백이 불필요하다.
 *
 * 실제 Supabase 프로젝트가 아직 연결되지 않아, 제출 로직(BFF 호출)은 완성해두되
 * handleFormSubmit에서 e.preventDefault()로 실제 네트워크 요청 직전에 막아둔다.
 * Supabase 연결(MCP) 이후 이 가드만 제거하면 된다.
 */
export function LoginForm() {
  const router = useRouter();
  const form = useAppForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitLogin = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      await apiClient.post('/api/auth/login', values);
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          router.push('/auth/verify-email');
          return;
        }
        setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다');
        return;
      }
      throw error;
    }
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    // Supabase 프로젝트가 아직 연결되지 않아 실제 네트워크 요청은 막아둔다.
    // 연결(MCP) 이후에는 아래 guard만 제거하면 submitLogin이 그대로 동작한다.
    const isSupabaseConnected = false;
    if (!isSupabaseConnected) {
      return;
    }

    return submitLogin(values);
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void handleFormSubmit(e);
      }}
      className="flex flex-col gap-4"
    >
      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Link href="/auth/forgot-password" className="text-xs text-muted-foreground underline">
        비밀번호를 잊으셨나요?
      </Link>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        로그인
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        아직 계정이 없으신가요?{' '}
        <Link href="/auth/register" className="underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
