import { RegisterForm } from '@/features/auth/ui/register-form';
import { getCurrentUser } from '@/shared/api/auth/get-current-user';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-center text-xl font-semibold">회원가입</h1>
      <RegisterForm />
    </main>
  );
}
