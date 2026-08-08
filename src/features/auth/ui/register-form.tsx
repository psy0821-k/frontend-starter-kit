'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/shared/ui/password-input';
import { cn } from '@/shared/lib/cn';
import { apiClient } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { useAppForm } from '@/shared/lib/hooks/use-app-form';
import { registerSchema, type RegisterFormValues } from '@/features/auth/model/schema';
import { PasswordRequirementList } from '@/features/auth/ui/password-requirement-list';
import { ConsentCheckboxGroup } from '@/features/auth/ui/consent-checkbox-group';
import { useNicknameAvailability } from '@/features/auth/lib/use-nickname-availability';

const NICKNAME_AVAILABILITY_MESSAGE: Record<
  'checking' | 'available' | 'unavailable' | 'error',
  string
> = {
  checking: '중복 확인 중...',
  available: '사용 가능한 닉네임입니다',
  unavailable: '이미 사용 중인 닉네임입니다',
  error: '중복 확인에 실패했습니다',
};

/**
 * 이메일 회원가입 폼.
 * mode: 'onChange'로 비밀번호 조건·비밀번호 확인 일치 여부를 타이핑 중 즉시 검증한다.
 *
 * 실제 Supabase 프로젝트가 아직 연결되지 않아, 제출 로직(BFF 호출)은 완성해두되
 * handleFormSubmit에서 e.preventDefault()로 실제 네트워크 요청 직전에 막아둔다.
 * Supabase 연결(MCP) 이후 이 가드만 제거하면 된다.
 */
export function RegisterForm() {
  const router = useRouter();
  const form = useAppForm(registerSchema, {
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      name: '',
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  });
  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const password = watch('password') ?? '';
  const nickname = watch('nickname') ?? '';
  const agreedToTerms = watch('agreedToTerms') ?? false;
  const agreedToPrivacy = watch('agreedToPrivacy') ?? false;
  const nicknameAvailability = useNicknameAvailability(nickname);

  const submitRegister = async (values: RegisterFormValues) => {
    setSubmitError(null);

    try {
      await apiClient.post('/api/auth/register', values);
      router.push('/auth/verify-email');
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.code === 'CONFLICT' ? '이미 가입된 이메일입니다' : error.message);
        return;
      }
      throw error;
    }
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    // Supabase 프로젝트가 아직 연결되지 않아 실제 네트워크 요청은 막아둔다.
    // 연결(MCP) 이후에는 아래 guard만 제거하면 submitRegister가 그대로 동작한다.
    const isSupabaseConnected = false;
    if (!isSupabaseConnected) {
      return;
    }

    return submitRegister(values);
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
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>
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
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby="password-requirements"
          {...register('password')}
        />
        <div id="password-requirements">
          <PasswordRequirementList password={password} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
        <PasswordInput
          id="passwordConfirm"
          autoComplete="new-password"
          aria-invalid={!!errors.passwordConfirm}
          aria-describedby={errors.passwordConfirm ? 'password-confirm-error' : undefined}
          {...register('passwordConfirm')}
        />
        {errors.passwordConfirm && (
          <p id="password-confirm-error" role="alert" className="text-xs text-destructive">
            {errors.passwordConfirm.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          type="text"
          autoComplete="nickname"
          aria-invalid={!!errors.nickname || nicknameAvailability === 'unavailable'}
          aria-describedby="nickname-status"
          {...register('nickname')}
        />
        <p
          id="nickname-status"
          role="status"
          aria-live="polite"
          className={cn(
            'text-xs',
            errors.nickname ||
              nicknameAvailability === 'unavailable' ||
              nicknameAvailability === 'error'
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {errors.nickname?.message ??
            (nicknameAvailability !== 'idle'
              ? NICKNAME_AVAILABILITY_MESSAGE[nicknameAvailability]
              : '')}
        </p>
      </div>

      <ConsentCheckboxGroup
        control={control}
        setValue={setValue}
        agreedToTerms={agreedToTerms}
        agreedToPrivacy={agreedToPrivacy}
        errors={errors}
      />

      <Button
        type="submit"
        disabled={isSubmitting || nicknameAvailability === 'unavailable'}
        className="mt-2 w-full"
      >
        회원가입
      </Button>
    </form>
  );
}
