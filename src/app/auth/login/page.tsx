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
