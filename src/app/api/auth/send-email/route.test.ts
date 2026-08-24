import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';

const verify = vi.fn();
const send = vi.fn();

vi.mock('standardwebhooks', () => ({
  Webhook: vi.fn().mockImplementation(function Webhook() {
    return { verify };
  }),
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send } };
  }),
}));

vi.mock('@/shared/config/env', () => ({
  env: {
    RESEND_API_KEY: 'test-resend-key',
    SEND_EMAIL_HOOK_SECRET: 'v1,whsec_dGVzdC1zZWNyZXQ=',
  },
}));

const { POST } = await import('./route');

const validPayload = {
  user: { email: 'user@example.com' },
  email_data: {
    token_hash: 'token-hash-value',
    redirect_to: 'http://localhost:3000',
    email_action_type: 'signup',
    site_url: 'http://localhost:3000',
  },
};

function createRequest(body: unknown = validPayload): Request {
  return new Request('http://localhost/api/auth/send-email', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'webhook-id': 'msg_1',
      'webhook-timestamp': '1700000000',
      'webhook-signature': 'v1,dummy',
    },
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/send-email', () => {
  it('서명 검증에 실패하면 401을 반환하고 메일을 발송하지 않는다', async () => {
    verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  it('서명 검증에 성공하면 confirm 링크가 포함된 메일을 Resend로 발송한다', async () => {
    verify.mockReturnValue(validPayload);
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    const [sendArg] = send.mock.calls[0] as [{ to: string[]; react: ReactElement }];
    expect(sendArg.to).toEqual(['user@example.com']);
    const html = renderToStaticMarkup(sendArg.react);
    expect(html).toContain(
      'http://localhost:3000/api/auth/confirm?token_hash=token-hash-value&amp;type=signup'
    );
  });

  it('Resend 발송이 실패하면 500을 반환한다', async () => {
    verify.mockReturnValue(validPayload);
    send.mockResolvedValue({ data: null, error: { message: 'send failed' } });

    const response = await POST(createRequest());

    expect(response.status).toBe(500);
  });
});
