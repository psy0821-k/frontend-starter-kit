import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/ui/login-form';
import { GoogleAuthButton } from '@/features/auth/ui/google-auth-button';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-center text-xl font-semibold">로그인</h1>
      <div className="rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          도메인 미검증으로 회원가입 이메일 발송이 제한되어 신규 가입이 되지 않습니다. 아래 테스트
          계정으로 로그인해보세요(관리자 권한 없음).
        </p>
        <p className="mt-1 font-mono">test01@example.com / TestPassword123!</p>
      </div>
      <LoginForm />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div aria-hidden="true" className="h-px flex-1 bg-border" />
        또는
        <div aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <GoogleAuthButton />
    </main>
  );
}
