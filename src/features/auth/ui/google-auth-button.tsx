'use client';

import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/shared/api/supabase/client';

/**
 * Google OAuth로 즉시 가입/로그인하는 버튼.
 */
export function GoogleAuthButton() {
  const handleClick = async () => {
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
