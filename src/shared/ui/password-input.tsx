'use client';

import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/shared/lib/cn';

/**
 * 비밀번호 입력 필드 + 표시/숨김 토글 버튼.
 * shadcn Input에 "버튼 클릭 시 평문 표시" 정책을 주입한 래퍼.
 * 회원가입(비밀번호/비밀번호 확인)·로그인(비밀번호) 3곳에서 동일 요구가
 * 재현되어 2회 규칙을 충족했다.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={isVisible ? 'text' : 'password'} className={cn('pr-8', className)} {...props} />
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
        aria-pressed={isVisible}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {isVisible ? (
          <EyeIcon aria-hidden="true" className="size-4" />
        ) : (
          <EyeOffIcon aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}
