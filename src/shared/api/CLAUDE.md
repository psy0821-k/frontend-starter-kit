# src/shared/api — API 클라이언트 및 인증

서버와의 통신을 일원화하는 계층입니다.

## 구조

- **`client.ts`**: fetch 래퍼 (credentials 자동 포함)
- **`error.ts`**: ApiError 클래스 + 코드 카탈로그
- **`auth/`**: 세션 관리, 로그인/로그아웃
- **`endpoints/`** (프로젝트별): 도메인 엔드포인트 정의

## ApiError 처리

모든 API 에러는 `ApiError` 클래스로 표준화합니다:
```tsx
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string, // 'AUTH_REQUIRED', 'VALIDATION_ERROR' 등
    message: string,
  ) { ... }
}
```

에러 코드는 `types/api.ts`의 유니온 타입으로 관리 (단일 진실 공급원).

## 인증 흐름

Next.js Route Handler(BFF)를 통해 백엔드와 통신합니다:
- 클라이언트 → BFF → 백엔드
- 인증 토큰은 httpOnly 쿠키로 관리 (탈취 방지)

## AI와 협업할 때

- 새 엔드포인트 추가 시 BFF Route Handler 위치 명시
- ApiError 코드가 기존 카탈로그에 있는지 먼저 확인
- 환경변수 추가 시 `src/shared/config/env.ts`에서 Zod 검증 추가
