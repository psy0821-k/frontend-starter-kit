'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/shared/api/error';
import { useAppForm } from '@/shared/lib/hooks/use-app-form';
import { useNicknameAvailability } from '@/features/auth/lib/use-nickname-availability';
import { updateNickname } from '@/features/mypage/api/update-nickname';
import { nicknameSchema } from '@/features/mypage/model/schema';
import { z } from 'zod';

const nicknameFormSchema = z.object({ nickname: nicknameSchema });
type NicknameFormValues = z.infer<typeof nicknameFormSchema>;

const AVAILABILITY_MESSAGE: Record<string, string> = {
  available: '사용 가능한 닉네임입니다',
  unavailable: '이미 사용 중인 닉네임입니다',
};

export interface NicknameFormProps {
  currentNickname: string;
}

/**
 * 마이페이지 닉네임 변경 폼.
 * 기본은 읽기 전용 텍스트로 표시되고, "편집" 버튼을 눌러야 입력 필드로 전환된다.
 * 입력값이 currentNickname과 동일하면(trim 없이 문자열 그대로 비교) updateNickname을
 * 호출하지 않고 조용히 종료한다.
 */
export function NicknameForm({ currentNickname }: NicknameFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useAppForm(nicknameFormSchema, {
    mode: 'onChange',
    defaultValues: { nickname: currentNickname },
  });
  const {
    register,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const { ref: nicknameInputRef, ...nicknameField } = register('nickname');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const nickname = watch('nickname');
  const availability = useNicknameAvailability(isEditing ? (nickname ?? '') : '');

  const startEditing = () => {
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEditing = () => {
    reset({ nickname: currentNickname });
    setSubmitError(null);
    setIsEditing(false);
  };

  const submitNickname = async (values: NicknameFormValues) => {
    setSubmitError(null);

    if (values.nickname === currentNickname) {
      setIsEditing(false);
      return;
    }

    try {
      await updateNickname(values.nickname);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      throw error;
    }
  };

  const handleFormSubmit = form.handleSubmit((values) => submitNickname(values));

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>닉네임</Label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">{currentNickname}</p>
          <Button type="button" variant="outline" size="sm" onClick={startEditing}>
            편집
          </Button>
        </div>
      </div>
    );
  }

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
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          aria-invalid={!!errors.nickname}
          aria-describedby={errors.nickname ? 'nickname-error' : undefined}
          {...nicknameField}
          ref={(node) => {
            nicknameInputRef(node);
            inputRef.current = node;
          }}
        />
        {errors.nickname && (
          <p id="nickname-error" role="alert" className="text-xs text-destructive">
            {errors.nickname.message}
          </p>
        )}
        {!errors.nickname && nickname !== currentNickname && AVAILABILITY_MESSAGE[availability] && (
          <p className="text-xs text-muted-foreground">{AVAILABILITY_MESSAGE[availability]}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          변경
        </Button>
        <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSubmitting}>
          취소
        </Button>
      </div>
    </form>
  );
}
