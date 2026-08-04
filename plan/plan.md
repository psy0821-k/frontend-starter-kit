# Frontend Starter Platform — 최종 기획안

**작성일**: 2026-08-03  
**상태**: Opus 모델 기반 5인 팀 검토 완료  
**목적**: AI와 함께 빠르게 실무 프로젝트를 시작할 수 있는 재사용 가능한 Frontend Starter Platform 구축

---

## 1. 프로젝트 정의

### 목표
- 포트폴리오·실무 프론트엔드 프로젝트 반복 개발 제거
- 랜딩페이지, 포트폴리오, 쇼핑몰, ERP, 관리자, 블로그 등 다양한 프로젝트 유형에 공통 적용 가능한 기반 제공
- 현재: 개인 사용 Starter Platform 구축 (상용화는 반응 확인 후 검토)

### 핵심 가치
- **재사용성**: 다음 프로젝트에서도 그대로 사용 가능한가
- **유지보수성**: 코드 이해와 수정이 쉬운가
- **확장성**: 새로운 기능을 추가할 여유가 있는가
- **일관성**: 전체 프로젝트 구조가 일관되는가
- **AI 협업성**: Claude 등 AI가 이해하고 수정하기 쉬운 구조인가

---

## 2. 기술 스택 (확정)

| 카테고리 | 선택 | 사유 |
|---|---|---|
| **프레임워크** | Next.js 15 (App Router) | React 기반, 서버/클라이언트 통합, SSR/SSG 지원 |
| **언어** | TypeScript | 타입 안정성, AI 친화성 |
| **스타일** | Tailwind CSS 4 | 유틸리티 기반, 재사용성 높음 |
| **UI** | shadcn/ui | 복사 가능한 컴포넌트, 완전한 커스터마이징 |
| **상태(UI)** | Zustand | 가볍고 간결, 보일러플레이트 최소 |
| **상태(서버)** | TanStack Query (v5) | React Server Components와 호환, 캐싱/동기화 표준화 |
| **폼** | React Hook Form + Zod | 타입 안전, 유효성 검증 자동화 |
| **테스트** | Vitest + Playwright | 속도, 모던 API, 브라우저 자동화 |
| **접근성** | vitest-axe + eslint-plugin-jsx-a11y | 자동화, pre-commit 통합 |
| **린팅** | ESLint + Prettier + Husky | 표준 규칙, 자동 포맷팅 |

### 제외 항목
- Redux: Zustand로 충분 (과설계)
- Storybook: *.example.tsx + 라이브 데모 페이지로 대체 (1인 개발 비용)
- MSW: Route Handler 목업으로 충분 (선택적 추가)

---

## 3. 아키텍처

### 3.1 폴더 구조 (단일 레포)

```
frontend-starter-platform/
├── .claude/
│   └── scheduled_tasks.lock
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 라우트
│   │   ├── (dev)/             # 개발용 (프로덕션 제외)
│   │   │   ├── components/    # 컴포넌트 쇼케이스
│   │   │   └── patterns/      # 패턴 예시
│   │   ├── api/               # Route Handlers (BFF)
│   │   │   ├── auth/
│   │   │   └── mock/          # 개발용 목업
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # 재사용 컴포넌트
│   │   ├── ui/                # shadcn 기반 P0 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (12종)
│   │   ├── app/               # 도메인 컴포넌트 (프로젝트별 변경)
│   │   └── patterns/          # 재사용 패턴 (폼, 인증, 에러)
│   ├── lib/                   # 공유 유틸 및 설정
│   │   ├── api/               # API 클라이언트
│   │   │   ├── client.ts      # fetch 래퍼
│   │   │   ├── error.ts       # ApiError 클래스
│   │   │   └── endpoints/     # 엔드포인트 정의 (프로젝트별)
│   │   ├── auth/              # 인증 관련
│   │   │   ├── session.ts
│   │   │   └── protect.ts
│   │   ├── env.ts             # 환경변수 검증 (Zod)
│   │   ├── hooks/             # 커스텀 훅
│   │   │   ├── useAuth.ts
│   │   │   └── ...
│   │   ├── store/             # Zustand 슬라이스
│   │   │   ├── create-store.ts # 팩토리
│   │   │   └── ...
│   │   ├── styles/            # 전역 스타일, 토큰
│   │   │   └── globals.css    # Tailwind 설정
│   │   ├── utils/             # 순수 함수
│   │   └── cn.ts              # className 병합
│   ├── schemas/               # Zod 스키마
│   │   ├── common.ts          # 공통 필드 (이메일, 전화번호)
│   │   ├── auth.ts
│   │   └── ...
│   └── types/                 # 공유 타입
│       ├── api.ts             # API 응답
│       └── domain.ts
├── tests/                      # 테스트
│   ├── unit/                  # Vitest
│   │   ├── components/
│   │   └── lib/
│   ├── e2e/                   # Playwright
│   │   └── auth.spec.ts       # 핵심 시나리오 3~5개
│   └── mocks/                 # 테스트 데이터
├── .husky/                    # Git Hooks
│   ├── pre-commit            # lint-staged
│   └── pre-push              # 타입체크, 테스트
├── CLAUDE.md                  # 프로젝트 컨텍스트
├── .eslintrc.json
├── prettier.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

### 3.2 의존성 규칙 (ESLint `import/no-restricted-paths`)
```
app → features → components/lib → types
       (단방향)
```
- `components`는 `app`을 import하지 않음
- `lib`은 `components`를 import하지 않음
- 역방향 import 시 린트 에러

### 3.3 커널 승격 규칙 ("2회 규칙")

`shared-kernel`(components/ui, lib)과 `app`(도메인 코드)의 경계가 시간이 지나며 무너지는 것을 방지하기 위한 명시적 승격 기준:

> **실제 프로젝트에서 동일한 코드가 2번 이상 필요했을 때만 shared-kernel로 승격한다.**

- 추측 기반 선제 구현(P1/P2 컴포넌트 조기 유입) 금지 — "재사용 가능해 보인다"는 이유만으로 커널에 넣지 않음
- 1개 프로젝트에서만 쓰인 코드는 해당 프로젝트의 `app/` 또는 `features/`에 남겨둠
- 2번째 프로젝트에서 동일 요구가 재현되면, 공통 부분만 추출해 커널로 이동 + 테스트/문서 추가
- 커널에 있었지만 실제로 재사용되지 않는 코드는 주기적으로 강등(제거 또는 도메인으로 이동) 검토

### 3.4 컴포넌트 완료 정의 (Definition of Done)

P0 컴포넌트가 `components/ui`에 커밋되기 전 반드시 충족해야 하는 4가지 최소 기준 (§7.1 상세 체크리스트의 축약형):

1. **타입 명시** — props 타입 export, `any` 없음
2. **접근성** — role/aria 속성, 키보드 네비게이션 동작
3. **반응형 3단계** — 모바일/태블릿/데스크톱에서 깨지지 않음
4. **사용 예제 1개** — `*.example.tsx` 또는 데모 페이지에 최소 1개 사용 사례 등록

문서·테스트를 컴포넌트마다 전부 갖추면 실제 비용이 3배로 늘어나므로(§9 리스크 참고), MVP 단계에서는 이 4개 기준만 게이트로 유지하고 나머지(스토리북, 시각 회귀 등)는 후순위로 미룬다.

---

## 4. 핵심 패턴 (재사용성)

### 4.1 상태관리 패턴

**UI 상태 (Zustand)**
```typescript
// lib/store/create-store.ts — 팩토리
export const createAppSlice = <T>(name: string, initialState: T) => (
  set: SetState<T>
) => ({
  ...initialState,
  reset: () => set(initialState),
});

// 사용: lib/store/ui.ts
export const useUiStore = create<UiState>((set) => ({
  ...createAppSlice('ui', INITIAL_UI),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

**서버 상태 (TanStack Query)**
```typescript
// lib/hooks/queries.ts
export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5분
  });

// 컴포넌트
const { data, isLoading, error } = useProducts();
```

### 4.2 폼 패턴

**공통 래퍼 (RHF + Zod)**
```typescript
// lib/form/use-app-form.ts
export const useAppForm = <T extends Record<string, any>>(schema: ZodSchema) =>
  useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

// 스키마 재사용
// schemas/auth.ts
export const loginSchema = z.object({
  email: commonSchema.email,
  password: z.string().min(8),
});

// 컴포넌트
const form = useAppForm(loginSchema);
```

### 4.3 API 클라이언트 패턴

**단일 fetch 래퍼**
```typescript
// lib/api/client.ts
export class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${env.API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // httpOnly 쿠키 자동 포함
    });
    if (!res.ok) {
      throw new ApiError(res.status, 'API_ERROR', res.statusText);
    }
    return res.json() as T;
  }

  get = <T>(endpoint: string) => this.request<T>(endpoint);
  post = <T>(endpoint: string, data: any) =>
    this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
}

export const apiClient = new ApiClient();
```

**인증 플로우 (httpOnly 쿠키)**
```
Client                    BFF (Route Handler)           Backend
  |                              |                          |
  +------ POST /api/auth/login --+                         |
  |                              +---- POST /auth/login ---+
  |                              |                         |
  |                              |    { accessToken, refreshToken }
  |                              |<----+
  |                              |
  |                              | (set httpOnly cookies)
  |                              |
  |<----- 200 OK ----------------+
  |
  | (쿠키 자동 포함)
  +------ GET /api/products -----+
  |                              +---- GET /products (with Authorization header)
  |                              |
  |                              |<---- { products }
  |<----- 200 OK ----------------+
```

### 4.4 에러 처리 표준화

**ApiError 클래스**
```typescript
// lib/api/error.ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string, // 'AUTH_REQUIRED', 'VALIDATION_ERROR', etc
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}
```

**전역 에러 바운더리**
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (error instanceof ApiError && error.isAuthError) {
    redirect('/login');
  }
  return <ErrorComponent error={error} reset={reset} />;
}
```

**에러 코드 카탈로그**

`ApiError.code` 값은 `types/api.ts`의 유니온 타입으로 단일 관리(단일 진실 공급원)한다.
```typescript
// types/api.ts
export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR';
```
백엔드가 별도로 존재하는 프로젝트에서는 이 타입을 프론트 기준으로 유지하고, 백엔드 응답의 `code` 필드가 이 유니온과 어긋나면 Route Handler(BFF) 계층에서 매핑해 흡수한다 — 백엔드 스펙 변경이 프론트 타입을 직접 깨지 않도록 경계를 유지.

---

## 5. 디자인 시스템

### 5.1 색상 토큰 (3계층)

**Primitive** → Semantic → Component 계층 구조
- Neutral: 9단계 (gray-50 ~ gray-950)
- Brand: 1종
- Semantic: success(green), warning(yellow), danger(red), info(blue) × light/dark

**구현** (Tailwind `theme.extend`)
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        'bg-primary': 'hsl(var(--color-bg-primary) / <alpha-value>)',
        'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
        'border-muted': 'hsl(var(--color-border-muted) / <alpha-value>)',
      },
    },
  },
};
```

**CSS 변수** (라이트/다크 모드)
```css
/* globals.css */
:root {
  --color-bg-primary: 0 0% 100%; /* white */
  --color-text-primary: 0 0% 0%; /* black */
}

[data-theme='dark'] {
  --color-bg-primary: 0 0% 8%; /* near-black */
  --color-text-primary: 0 0% 98%;
}
```

### 5.2 타이포그래피

- 폰트: 시스템 폰트 (per-project 커스터마이징 가능)
- Scale: xs(12px) → sm(14px) → base(16px) → lg(18px) → xl(20px) → 2xl(24px)
- Weight: 400(regular), 500(medium), 700(bold)만 허용

### 5.3 스페이싱

- 기본 단위: 4px (Tailwind 기본 scale)
- 공통 값: 2, 4, 6, 8, 12, 16, 24, 32, 48 (배수)
- 커스텀 스페이싱 추가 금지 (프로젝트 일관성 유지)

---

## 6. AI 협업 구조

### 6.1 프로젝트 컨텍스트 (CLAUDE.md)

**루트 CLAUDE.md** — 전역 규칙
```markdown
# 프로젝트 개요
- Starter Platform 성격, 재사용성 최우선
- 불필요한 추상화 금지, 기존 패턴 우선 재사용

# 파일 위치 및 네이밍
- 컴포넌트: `src/components/ui/` (P0)
- 폼 패턴: `src/components/patterns/form-example.tsx`
- API: `lib/api/` 내 도메인별 엔드포인트
- Zustand 슬라이스: `lib/store/` 내 도메인별

# 코드 스타일
- 변수/함수: camelCase
- 컴포넌트/타입: PascalCase
- 파일: kebab-case
- JSDoc: props와 사용 예시 주석만 (WHY는 필수, WHAT은 선택)
- any 금지

# 협업 가이드
1. 새 컴포넌트는 곧바로 커널(components/ui, lib)에 넣지 않는다 — "2회 규칙"(§3.3) 적용: 동일 요구가 2번째 프로젝트에서 재현될 때만 승격
2. 개발 과정 중 "이미 있는 패턴이 있는가?" 먼저 확인
3. 기능 추가 시 단위 테스트 + JSDoc 주석 함께 작성
```

**폴더별 CLAUDE.md**
```markdown
# src/components/ui/CLAUDE.md
shadcn/ui 기반 P0 컴포넌트 디렉터리
- variant 추가 시: CVA(class-variance-authority) 사용, 타입 export 필수
- 상태 관리: 컴포넌트는 지역 상태만 (폼/글로벌은 밖에서 관리)
- 접근성: role, aria-*, keyboard nav 모두 내장

# src/lib/api/CLAUDE.md
API 통신 계층
- 모든 엔드포인트는 Route Handler 통해 접근
- 에러는 ApiError 클래스로 통일
- 환경변수는 env.ts에서만 읽음
```

### 6.2 코드 예시 파일 (*.example.tsx)

**구조**
```
src/components/patterns/form-example.tsx
```

**내용** — 실제 패턴 코드의 "최소 작동 예시"
```typescript
// form-example.tsx
'use client';

import { useAppForm } from '@/lib/form/use-app-form';
import { loginSchema } from '@/schemas/auth';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

export function LoginFormExample() {
  const form = useAppForm(loginSchema);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // 실제 구현 예시
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    // ...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
```

### 6.3 AI 협업 프롬프트 템플릿

**요청 템플릿**
```
## 요청
폼 컴포넌트가 필요합니다.

## 맥락
- 스키마: `schemas/auth.ts`의 `loginSchema` 재사용
- 패턴: `components/patterns/form-example.tsx` 참고
- 위치: `src/components/patterns/login-form.tsx` 새로 생성
- 제약: CVA 없이 기본 tailwind 클래스만 사용

## 요청 사항
1. useAppForm 훅 사용
2. 각 필드에 JSDoc 주석
3. 테스트 파일도 함께 생성 (tests/unit/components/login-form.test.tsx)
```

---

## 7. QA & 품질 전략

### 7.1 컴포넌트 편입 체크리스트 (P0)

P0 컴포넌트는 다음 7개 항목을 모두 통과해야 라이브러리에 편입됨:

| # | 항목 | 검증 방법 | 통과 기준 |
|---|---|---|---|
| 1 | 렌더 스모크 | Vitest | 필수 props만으로 에러 없이 렌더, DOM 스냅샷 일치 |
| 2 | Props 분기 | Vitest (userEvent) | variant/size 모든 값이 각각 렌더됨 |
| 3 | 상호작용 | Vitest (userEvent) | 콜백이 정확히 1회 호출, 인자 검증 |
| 4 | 상태 경계 | Vitest | loading/empty/error 상태가 각각 렌더 (해당 시) |
| 5 | 접근성 | vitest-axe | role/aria/키보드 네비게이션 통과 |
| 6 | 스타일 병합 | Vitest | className 병합이 동작, 외부 클래스 최종 DOM에 반영 |
| 7 | 타입 안정성 | tsc --noEmit | any 없음, props 타입 export, 타입체크 통과 |

### 7.2 테스트 로드맵

| 단계 | 범위 | 커버리지 |
|---|---|---|
| **MVP** | Vitest 유닛(P0 체크리스트 1~4, 7) · vitest-axe · eslint-jsx-a11y · Husky pre-commit · Playwright 스모크 3개 | lib/hooks 85% |
| **2차** | Storybook + test-runner · axe-playwright 페이지 검사 · GitHub Actions PR 워크플로 · 수동 a11y 점검 | lib/hooks 85%, ui/ 70% |
| **3차** | 크로스 브라우저(Firefox/WebKit) · 시각 회귀(Chromatic) · 성능 예산(Lighthouse CI) | 전역 60%+ |

### 7.3 Husky 설정

**pre-commit** (2초 이내)
```bash
npx lint-staged
```

**lint-staged 설정** (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

**pre-push** (장시간 ok)
```bash
npx tsc --noEmit && npx vitest run --changed origin/main
```

---

## 8. 개발 로드맵 (7 스프린트 = 14주)

> **기획자 검토 반영**: "검증 없는 자산화"가 최대 리스크로 지적됨(§9). 컴포넌트를 먼저 다 만들고 나중에 실적용하는 순서 대신, **S2부터 포트폴리오 사이트에 병행 적용**하여 만들면서 검증하는 흐름으로 재배치. 샘플 프로젝트는 기존 3종 계획을 **1종(포트폴리오 사이트)** 으로 축소(QA·기획자 공통 권고 — 유지보수 비용이 본체를 초과).

### S1: 기초 구조 (1주)
- [ ] 폴더 구조 및 린트 설정 (`import/no-restricted-paths`로 §3.2 의존성 규칙 강제)
- [ ] Tailwind + 색상 토큰
- [ ] 루트 CLAUDE.md + 폴더별 CLAUDE.md
- [ ] env.ts 검증
- [ ] Husky 훅 설정
- [ ] 포트폴리오 사이트 뼈대 병행 착수 (실적용 채널 확보)

**산출물**: 빈 프로젝트 뼈대 완성

### S2: P0 컴포넌트 (2주)
- [ ] shadcn/ui 12종 복사 및 커스터마이징
  - Button, Input, Form, Card, Dialog, Table
  - Dropdown-menu, Badge, Toast (sonner), Skeleton, Tabs, Avatar
- [ ] 각 컴포넌트 DoD(§3.4) 4개 기준 충족 확인
- [ ] 단위 테스트 (체크리스트 1~4)
- [ ] vitest-axe 통합
- [ ] **포트폴리오 사이트에 즉시 적용**하며 실사용 검증

**산출물**: P0 컴포넌트 라이브러리 + 테스트 + 실사용 1건

### S3: 상태관리 & 폼 패턴 (2주)
- [ ] Zustand 슬라이스 팩토리 작성
- [ ] TanStack Query 설정 (staleTime, retry 정책)
- [ ] RHF + Zod 공통 래퍼 작성
- [ ] 3개 예시 (로그인, 상품 목록, 필터 폼) — **포트폴리오 사이트의 실제 기능으로 구현**
- [ ] 패턴별 단위 테스트

**산출물**: 재사용 가능한 패턴 3~4종 + 테스트 (모두 실사용 검증됨)

### S4: API & 인증 (2주)
- [ ] ApiClient 클래스 + 에러 표준화 (에러 코드 카탈로그 §4.4 확정)
- [ ] Route Handler 목업 (/api/auth, /api/products)
- [ ] httpOnly 쿠키 인증 플로우 (refresh 단일 인플라이트 뮤텍스 포함)
- [ ] 환경변수 관리 확정
- [ ] 에러 바운더리 구현

**산출물**: 실제 API 연동 가능한 상태

**🔴 게이트**: S4 완료 후 "패턴이 정말 재사용 가능한가?" 검증 회고
- 판단 근거: 포트폴리오 사이트에서 실제로 재사용된 패턴/컴포넌트 비율 (§3.3 "2회 규칙" 충족 항목 집계)
- 자신 있음 → S5~7 진행
- 개선 필요 → S4 다시 진행

### S5: 포트폴리오 완성 (2주)
- [ ] 포트폴리오 사이트 남은 기능 완성 (S1~S4에서 이미 대부분 병행 적용됨)
- [ ] 실적용 과정에서 나온 개선사항 Starter에 역반영
- [ ] "2회 규칙" 미충족 컴포넌트/패턴은 커널에서 제외 검토

**산출물**: 첫 번째 프로젝트(포트폴리오) 완성 + Starter 피드백 반영 완료

### S6: 개선 & P1 컴포넌트 (2주)
- [ ] S5 피드백 반영해 Starter 개선
- [ ] P1 컴포넌트 추가 (DataTable, Sheet, Command, Pagination 등)
- [ ] Storybook 또는 데모 페이지 구축
- [ ] GitHub Actions CI 도입

**산출물**: 개선된 Starter Platform v1

### S7: 문서 & 2차 프로젝트 (2주)
- [ ] README, 개발 가이드 작성
- [ ] 두 번째 프로젝트에 적용
- [ ] 추가 회귀 테스트 및 개선

**산출물**: 문서화된 Starter Platform ready-to-use

---

## 9. 미결정 항목 (아이테레이션 중 확정)

| 항목 | 영향 | S4 후 재검토 |
|---|---|---|
| TanStack Query 필수 여부 | 중 | 서버 상태가 simple한 프로젝트는 Zustand만으로 충분할 수 있음 → 조건부 포함 검토 |
| Storybook vs 데모 페이지 | 중 | 초기엔 데모 페이지, 프로젝트 수 증가 시 Storybook 검토 |
| CSRF 방어 | 중 | SameSite 쿠키만으로 충분한지, CSRF 토큰 필요한지 실무 검증 후 결정 |
| 다크모드 필수 여부 | 저 | CSS 변수 구조는 준비하되, 실제 toggle UI는 프로젝트별 선택 |

### 기획자 검토에서 식별된 미해결 경계

4개 관점 기획안은 서로 충돌 없이 정합적이었으나(§1 배경), 다음 3가지는 아직 규칙이 없어 이번 문서에서 명시적으로 확정함:

1. **`shared-kernel`↔`app` 의존 규칙** → §3.2(단방향 import 강제), §3.3("2회 규칙")으로 해결
2. **에러 코드 카탈로그 소유권** → §4.4에서 `types/api.ts` 단일 관리 + BFF 계층 매핑으로 해결
3. **디자인 토큰 변경 시 회귀 검증 방법** → 미해결. QA의 "시각적 회귀 후순위"(3차 도입)와 UX의 토큰 중심 설계가 충돌 지점. **잠정 결론**: 토큰 변경은 드물게 발생하므로 3차 이전에는 수동 검증(다크모드 토글 후 P0 컴포넌트 쇼케이스 페이지 육안 확인)으로 대체, 3차에서 Chromatic 도입 시 정식 편입

---

## 10. 성공 기준

- [ ] 첫 번째 프로젝트 적용 완료
- [ ] 두 번째 프로젝트에서 개발 시간 30% 이상 단축 (Starter 없는 경우 대비)
- [ ] 컴포넌트 재사용률 70% 이상
- [ ] 테스트 커버리지 lib/hooks 85% 이상
- [ ] AI(Claude)와 협업 시 컨텍스트 참조로 대부분 해결 가능 (프롬프트 1회 반복 이내)

---

## 참고

- **1차 기획 (Sonnet)**: UX, 프론트엔드, 백엔드, QA 4가지 관점 기획 통합
- **2차 검토 (Opus, 5인 팀)**: 기획자(PM), 프론트엔드, 백엔드, QA, AI 아키텍처 전문가가 1차 기획을 자료수집→검토→보완
  - 기획자: 4개 관점 정합성 검토, 리스크 식별("검증 없는 자산화", "과추상화"), 커널 승격 규칙·DoD 제안
  - 프론트엔드: 폴더 구조 상세화, TanStack Query 공백 지적, "얇은 래퍼" 조건부 평가
  - 백엔드: Route Handler BFF 한계, 인증 플로우·ApiError 설계 구체화
  - QA: 테스트 커버리지 현실화, 샘플 프로젝트 3종→1종 축소 권고, 컴포넌트 편입 체크리스트 7항목
  - AI 아키텍처: CLAUDE.md/*.example.tsx 구조 검토 (현재 프로젝트 디렉터리가 비어 있어 실물 검증은 보류, S1 이후 재검토 필요)
- **현재 상태**: 프로젝트 디렉터리는 비어 있음 (S1부터 시작)

---

**Next Step**: 이 plan.md에 동의 후 S1 착수
