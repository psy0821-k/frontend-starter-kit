import { MailIcon } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col items-center gap-3 px-4 py-24 text-center">
      <MailIcon aria-hidden="true" className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">인증 메일을 보냈습니다</h1>
      <p className="text-sm text-muted-foreground">
        입력하신 이메일로 인증 메일을 발송했습니다. 메일함에서 인증 링크를 확인한 뒤 로그인해주세요.
      </p>
    </main>
  );
}
