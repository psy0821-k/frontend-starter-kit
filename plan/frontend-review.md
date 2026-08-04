# 프론트엔드 검토 보고서

## 1. 기술 스택 최종 평가
기존 스택(Next.js App Router, React, TS, Tailwind, shadcn/ui, Zustand, RHF+Zod, Playwright, Vitest)은 **대체로 최적**. 단, 조정 필요:

| 항목 | 판정 | 사유 |
|---|---|---|
| Next.js App Router | 유지 | RSC로 데이터 페칭 단순화 |
| Zustand | **범위 축소** | 서버 상태를 담지 말 것. UI 상태 전용 |
| **TanStack Query 추가** | 추가 | 서버 상태 캐시/무효화 부재가 최대 공백 |
| shadcn/ui | 유지 | 코드 소유 = AI 수정 용이 |
| RHF + Zod | 유지 | Zod 스키마를 API 계약과 공유 |
| Playwright / Vitest | 유지 | E2E는 핵심 플로우 3~5개로 제한 |
| **제거 권장** | Storybook, Redux, CSS-in-JS | 초기 단계 오버헤드 |

## 2. 상세 폴더 구조

```
final-project/
├─ CLAUDE.md
├─ src/
│  ├─ app/                    # 라우팅 전용, 로직 금지
│  │  ├─ (auth)/login/page.tsx
│  │  └─ (main)/dashboard/page.tsx
│  ├─ features/               # 도메인 수직 슬라이스
│  │  └─ order/
│  │     ├─ api/              # 쿼리/뮤테이션 훅
│  │     ├─ model/            # 스키마·타입
│  │     ├─ ui/               # 도메인 컴포넌트
│  │     └─ CLAUDE.md
│  ├─ shared/                 # shared-kernel
│  │  ├─ ui/                  # 얇은 래퍼 (Button, Modal)
│  │  ├─ lib/                 # 순수 유틸
│  │  ├─ api/                 # fetch 클라이언트
│  │  └─ config/
│  └─ components/ui/          # shadcn 원본 (직접 수정 금지)
├─ e2e/
└─ docs/adr/
```

의존 방향: `app → features → shared` (역방향 금지, ESLint `import/no-restricted-paths`로 강제)

## 3. 재사용성 패턴 검증

**"얇은 래퍼" 철학은 조건부로 작동한다.** 래퍼가 shadcn 원본을 단순 재export하면 무가치하고, 프로젝트 규칙을 주입할 때만 가치가 생긴다.

### 예시 1: 정책 주입형 래퍼 (작동 O)
```tsx
// shared/ui/button.tsx
export function Button({ loading, children, ...props }: ButtonProps) {
  // 프로젝트 규칙: 로딩 중 자동 disable + 스피너
  return (
    <ShadcnButton disabled={loading || props.disabled} {...props}>
      {loading && <Spinner className="mr-2" />}
      {children}
    </ShadcnButton>
  );
}
```

### 예시 2: 폼 필드 조합 (중복 제거 효과 큼)
```tsx
// shared/ui/form-field.tsx — label/error/aria를 1회 정의
<FormField name="email" label="이메일" control={control} />
```
RHF `useController` + Zod 에러 메시지를 자동 연결. 폼 화면당 30~40줄 절감.

### 예시 3: 데이터 상태 래퍼 (분기 중복 제거)
```tsx
// shared/ui/async-boundary.tsx
<AsyncBoundary loading={isLoading} error={error} empty={!data?.length}>
  <OrderTable data={data} />
</AsyncBoundary>
```
로딩/에러/빈 상태 3분기 if문이 전 화면에서 사라짐.

### 예시 4: 안티패턴 (작동 X)
```tsx
export { Input } from '@/components/ui/input'; // 재export만 = 삭제 대상
```
**규칙: 래퍼는 "추가 동작"이 있을 때만 생성한다.**

## 4. CLAUDE.md 배치 전략
- **루트**: 전역 규칙(네이밍, 금지사항, 의존 방향)
- **`src/features/*/CLAUDE.md`**: 도메인 용어·비즈니스 규칙
- **`src/shared/ui/CLAUDE.md`**: 래퍼 생성 기준

`*.example.tsx` 방식은 **부분적으로만 효과적**. Claude는 실제 코드를 읽으므로 예시 파일이 실 코드와 어긋나면 오히려 해롭다. 대안: 예시 파일 대신 **각 폴더의 대표 구현 1개를 CLAUDE.md에서 "이 파일을 참조하라"고 지목**. 유지보수 비용 0, 항상 최신.

## 5. 단계별 로드맵 (2주 단위)

| 스프린트 | 기간 | 산출물 |
|---|---|---|
| S1 | 1~2주 | 프로젝트 셋업, ESLint 의존 규칙, CI, CLAUDE.md 초안 |
| S2 | 3~4주 | shared/ui 핵심 10종, 디자인 토큰, AsyncBoundary/FormField |
| S3 | 5~6주 | 인증 플로우 + API 클라이언트 + 에러 처리 표준 |
| S4 | 7~8주 | 핵심 도메인 기능 1 (수직 슬라이스 레퍼런스) |
| S5 | 9~10주 | 도메인 기능 2~3 (S4 패턴 복제·검증) |
| S6 | 11~12주 | E2E 핵심 플로우, 성능(LCP/번들), 접근성 |
| S7 | 13~14주 | 안정화, 문서 정리, 릴리즈 |

S4 완료 시점에 **패턴 회고 게이트**를 두어 S5 이전에 구조를 확정한다.

## 6. 보완 필요 항목
1. **서버 상태 전략 부재** — TanStack Query 도입 및 Zustand와의 경계 문서화 (최우선)
2. **API 계약 관리** — OpenAPI → 타입 자동 생성 여부 미결정
3. **에러/로딩 표준** — 전역 ErrorBoundary, 토스트 정책 미정
4. **디자인 토큰** — Tailwind config의 색/간격 토큰 정의 필요
5. **인증 토큰 저장 위치** — 쿠키(httpOnly) 권장, 미결정 상태
6. **성능 예산** — 번들 사이즈/LCP 임계값 미설정
