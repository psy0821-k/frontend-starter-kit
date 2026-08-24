import { Webhook } from 'standardwebhooks';
import { Resend } from 'resend';
import { VerificationEmail } from '@/features/auth/ui/verification-email';
import { env } from '@/shared/config/env';

interface SendEmailHookPayload {
  user: {
    email: string;
  };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

/**
 * Supabase Send Email Hook의 HTTPS 엔드포인트.
 *
 * Supabase Dashboard(Authentication > Hooks > Send Email hook)에 이 경로를
 * 등록하면, auth.signUp 등으로 인증 메일이 필요할 때마다 Supabase가 토큰을
 * 발급한 뒤 이 엔드포인트를 호출한다. 토큰 발급/검증은 그대로 Supabase가
 * 담당하고, 실제 메일 발송만 여기서 Resend로 가로챈다.
 *
 * 링크는 Supabase가 제안하는 /auth/v1/verify 대신, 이 프로젝트가 이미 쓰는
 * /api/auth/confirm 라우트로 구성한다(둘 다 verifyOtp에 token_hash/type을
 * 넘기는 동일한 목적이지만, 우리 confirm 라우트가 리다이렉트 처리를 겸한다).
 */
export async function POST(request: Request): Promise<Response> {
  if (!env.RESEND_API_KEY || !env.SEND_EMAIL_HOOK_SECRET) {
    return Response.json({ error: '이메일 발송 설정이 누락되었습니다' }, { status: 500 });
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);
  const hookSecret = env.SEND_EMAIL_HOOK_SECRET.replace('v1,whsec_', '');
  const webhook = new Webhook(hookSecret);

  let data: SendEmailHookPayload;
  try {
    data = webhook.verify(payload, headers) as SendEmailHookPayload;
  } catch {
    return Response.json({ error: '유효하지 않은 요청입니다' }, { status: 401 });
  }

  const {
    user: { email },
    email_data: { token_hash, redirect_to, email_action_type, site_url },
  } = data;

  const confirmUrl = `${site_url}/api/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: [email],
    subject: '회원가입 인증 메일',
    react: VerificationEmail({ confirmUrl }),
  });

  if (error) {
    return Response.json({ error: '메일 발송에 실패했습니다' }, { status: 500 });
  }

  return Response.json({});
}
