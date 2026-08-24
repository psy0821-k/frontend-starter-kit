interface VerificationEmailProps {
  confirmUrl: string;
}

/**
 * 회원가입 인증 메일 템플릿.
 * confirmUrl은 send-email Route Handler가 Supabase Send Email Hook의
 * email_data(token_hash, type)로 직접 구성해 전달한다.
 */
export function VerificationEmail({ confirmUrl }: VerificationEmailProps) {
  return (
    <div>
      <h1>회원가입을 환영합니다!</h1>
      <p>저희 사이트를 이용해주셔서 감사합니다.</p>
      <p>
        <a href={confirmUrl}>이 링크를 클릭해 회원가입 인증을 완료해주세요</a>
      </p>
    </div>
  );
}
