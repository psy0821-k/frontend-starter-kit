import { RegisterForm } from '@/features/auth/ui/register-form';

export default function RegisterPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-center text-xl font-semibold">회원가입</h1>
      <RegisterForm />
    </main>
  );
}
