'use client';

import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/shared/api/supabase/client';

/**
 * Google OAuth로 즉시 가입/로그인하는 버튼.
 * Supabase 프로젝트가 아직 연결되지 않아 실제 리다이렉트는 막아두고,
 * signInWithOAuth 호출 로직만 완성해둔다. 연결(MCP) 이후 guard만 제거하면 된다.
 */
export function GoogleAuthButton() {
  const handleClick = async () => {
    const isSupabaseConnected = false;
    if (!isSupabaseConnected) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => {
        void handleClick();
      }}
    >
      Google로 계속하기
    </Button>
  );
}
