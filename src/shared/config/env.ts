import { z } from 'zod';

/**
 * 환경변수 검증 (부팅 시점)
 * 유효하지 않은 환경변수는 즉시 에러를 발생시킵니다.
 */
/**
 * Supabase 값은 optional이다. 아직 프로젝트를 연결하지 않은 상태에서도
 * 앱이 뜨고 mock 데이터로 화면을 확인할 수 있어야 하기 때문이다.
 * 값이 없는 채로 Supabase를 실제 호출하면 createSupabaseServerClient가
 * 그 시점에 명확한 에러를 던진다(설정 누락을 조용히 넘기지 않는다).
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ 환경변수 검증 실패:');
    error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  throw error;
}

export const env = parsedEnv;
