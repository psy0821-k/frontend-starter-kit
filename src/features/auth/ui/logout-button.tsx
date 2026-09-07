'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/shared/api/client';

/**
 * 로그아웃 버튼.
 * 로그아웃 후 로그인 페이지로 이동하고, 서버 컴포넌트(Header)의 세션 상태를
 * 갱신하기 위해 router.refresh()를 호출한다. 이동이 시작되므로 성공 시에는
 * isLoading을 되돌리지 않는다.
 *
 * `DropdownMenuItem`의 `render` prop 대상으로도 사용할 수 있도록 나머지 props를
 * 그대로 전달한다(base-ui의 render prop 병합 규칙 — 대상 컴포넌트가 props/ref를
 * 전달해야 role/onClick 등이 실제 DOM에 적용된다).
 */
export function LogoutButton({ onClick, ...props }: React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/api/auth/logout');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isLoading}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        void handleClick();
      }}
    >
      로그아웃
    </Button>
  );
}
