# src/shared — Shared Kernel

공유 커널은 모든 `features`와 `app`이 공통으로 사용하는 재사용 가능한 기반입니다.

## 폴더별 역할

- **`ui/`**: shadcn/ui를 감싼 얇은 래퍼 컴포넌트 (정책 주입)
  - 예: Button(로딩 상태 처리), FormField(라벨/에러/aria 자동 연결), AsyncBoundary(loading/error/empty 통합)
  - 규칙: 원본 shadcn보다 코드가 길어지면 과추상화 신호 → 재검토 필요
  
- **`lib/`**: 순수 유틸 함수, 상수, 커스텀 훅
  - 예: `cn.ts`(className 병합), `format.ts`(날짜/숫자 포맷), `store/`(Zustand 슬라이스)
  
- **`api/`**: API 클라이언트, 인증, 에러 처리
  - 예: `client.ts`(fetch 래퍼), `error.ts`(ApiError), `auth/`(세션 관리)
  
- **`config/`**: 전역 설정 상수
  - 예: API 베이스 URL, timeout 값, 환경변수 검증(Zod)

## 의존 규칙

- `shared` → 아무것도 import하지 않음 (자기 내부만 사용)
- `features`, `app` → `shared` import 허용 (단방향)

## "2회 규칙" 적용

`shared`로 코드를 올릴 때는 **"다음 프로젝트에서도 쓸 수 있는가?"를 증명해야 한다**.

- 1개 프로젝트/기능에서만 쓰인 코드 → `features/` 또는 `app/`에 남겨두기
- 2번째 프로젝트나 동일 요구가 재현 → 공통 부분만 추출해 `shared`로 이동 + 테스트/문서 추가
- `shared`에 있지만 실제로 재사용되지 않는 코드 → 주기적으로 강등(제거/도메인 이동) 검토

## AI와 협업할 때

1. 새 컴포넌트/유틸 만들기 전 "이미 있는가?" 먼저 확인
2. `shared`에 올릴 때는 "이게 다음 프로젝트에서도 쓸 수 있나?" 판단 기준 함께 제시
3. 폴더별 구현 1개를 대표로 지목해서 패턴 참조 (예시 파일 대신 실 코드 참고)
