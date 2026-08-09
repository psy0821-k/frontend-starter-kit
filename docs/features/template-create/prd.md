# 템플릿 생성 기능 PRD

## 개요

관리자가 템플릿(스타터 킷)을 등록하는 기능을 아래 두 가지 변경사항 기준으로 정비한다.

1. 카테고리 값을 `Frontend/Backend/Fullstack/Mobile`에서 `erp/포트폴리오/쇼핑몰`로 변경한다.
2. 썸네일 입력 방식을 텍스트(경로/URL) 입력에서 Supabase Storage 파일 업로드로 변경한다.

기존에 이미 동작하는 등록 폼(`template-register-form.tsx`)·API(`POST /api/templates`)·DB 스키마(`templates`, `template_files`)를 기반으로 위 두 변경사항만 반영한다. 그 외 필드·검증·권한 정책은 [spec-fixed.md](./spec-fixed.md)에서 이미 확정된 대로 유지한다.

## 사용자 스토리

- 관리자로서, 템플릿을 등록할 때 카테고리를 `erp` / `포트폴리오` / `쇼핑몰` 중에서 선택하고 싶다. 현재 프로젝트가 다루는 스타터 유형(랜딩/포트폴리오/쇼핑몰/ERP)과 일치하는 분류가 필요하기 때문이다.
- 관리자로서, 썸네일 이미지를 텍스트로 경로를 입력하는 대신 파일을 직접 업로드하고 싶다. 미리 이미지를 어딘가에 올려두고 경로를 알아내야 하는 번거로움을 없애기 위함이다.

## 기술 결정

### 결정 1 — 카테고리 값을 enum 상수 직접 교체로 변경

**Context** — `STARTER_KIT_CATEGORIES`(`Frontend/Backend/Fullstack/Mobile`)를 프로젝트 유형 기준(`erp/포트폴리오/쇼핑몰`)으로 바꿔야 한다. 카테고리는 DB CHECK 제약, Zod enum, 폼 select, 필터 UI 등 여러 지점에서 동일 값을 참조하고 있어 값 자체를 바꿀지, 코드값/표시값을 분리할지 결정이 필요했다.

**Decision** — DB·API·UI 전 계층에서 참조하는 `STARTER_KIT_CATEGORIES` enum 값을 `['erp', '포트폴리오', '쇼핑몰']`로 직접 교체한다. 한글 값을 코드값이자 표시값으로 그대로 사용한다.

**Alternatives**

- 코드값(영문)+표시값(한글) 분리: URL 파라미터·검색 조건에 한글이 노출되는 것을 막을 수 있으나, 이번 스타터 킷 목록/상세는 카테고리를 URL 쿼리로 다루지 않고(필터는 클라이언트 상태) 매핑 계층을 유지할 실익이 없어 기각.
- 카테고리 테이블화(`categories` 테이블 신설): `src/features/starter-kit/model/types.ts`의 기존 주석이 "Supabase 카테고리 테이블 연동 전까지는 코드 상수로 고정 관리"라고 명시하고 있고, 현재 3개 값으로 고정되어 있어 테이블화의 이점(동적 추가/관리자 UI)이 없다. "2회 규칙" 위반(추측 기반 선제 구현)으로 기각.

**Consequences**

- 장점: `STARTER_KIT_CATEGORIES` 배열 값만 바꾸면 폼 select, 필터 UI, DB CHECK 제약이 모두 따라가는 단일 지점 변경이라 구현이 단순하다.
- 단점: 한글 값이 DB에 직접 저장되므로, 향후 다국어 지원이 필요해지면 이번 결정을 되돌려야 한다(코드값/표시값 분리로 재작업). 기존에 `Frontend/Backend/Fullstack/Mobile`로 등록된 데이터가 있다면 값 불일치가 발생하므로 별도 데이터 마이그레이션이 필요하다(Out of Scope에 명시).

### 결정 2 — 썸네일은 클라이언트가 Supabase Storage에 직접 업로드

**Context** — 썸네일을 텍스트 경로/URL 입력에서 실제 파일 업로드로 바꿔야 한다. `apiClient`(`src/shared/api/client.ts`)가 `Content-Type: application/json`을 고정하고 있어 기존 BFF 경로로는 멀티파트를 보낼 수 없다. 업로드 흐름을 BFF 경유로 새로 뚫을지, 클라이언트가 Storage와 직접 통신할지 결정이 필요했다.

**Decision** — 브라우저에서 `supabase-js` 클라이언트로 Storage의 public 버킷에 직접 업로드하고, 업로드 성공 후 반환된 공개 URL을 `thumbnail_url` 값으로 사용해 기존 `POST /api/templates` 요청에 포함한다. 업로드 권한은 Storage RLS 정책으로 관리자만 허용한다.

**Alternatives**

- BFF 경유 업로드(Route Handler가 멀티파트 수신 후 Storage로 전달): 모든 요청이 BFF를 거치는 기존 원칙에는 더 부합하지만, 서버가 파일을 한 번 더 받았다가 다시 Storage로 스트리밍하는 이중 홉이 생기고 Route Handler에 멀티파트 파싱 로직을 새로 추가해야 한다. 프로젝트가 이미 `templates`/`template_files`에서 "anon key + RLS가 최종 방어선"이라는 모델(마이그레이션 파일 주석 참조)을 채택하고 있어, Storage에도 동일 모델을 쓰는 안 A가 아키텍처 일관성이 더 높다고 판단해 기각.
- Base64 인코딩 후 기존 JSON payload에 포함: 서버 변경이 전혀 없다는 장점은 있으나, `templateFileSchema`가 이미 코드 필드에 100,000자 제약을 두는 등 텍스트 크기에 민감한 스키마인데 이미지 base64(원본 대비 약 33% 증가)까지 섞이면 스키마 성격이 불분명해진다. 명백한 임시방편으로 판단해 기각.

**Consequences**

- 장점: `apiClient`의 JSON 고정 제약을 건드릴 필요가 없다. Storage 업로드는 Supabase SDK가 처음부터 클라이언트에서 직접 쓰도록 설계한 기능이라 별도 프록시 계층 없이 자연스럽다.
- 단점: 업로드 권한 통제가 Route Handler(`requireAdmin`)가 아니라 Storage RLS로 이원화된다 — 등록 폼 접근 권한과 업로드 권한을 각각 다른 계층(Next.js 세션 vs Supabase RLS)에서 검증하게 되므로, 두 계층의 관리자 판정 로직이 어긋나지 않도록 항상 함께 갱신해야 한다. 또한 업로드 실패(네트워크 오류, 용량 초과 등)를 폼에서 별도로 핸들링하는 로직이 새로 필요하다(기존 `submitError` 흐름과는 별개의 에러 경로).

## Out of Scope

- 프리뷰 이미지(preview_images)의 Storage 업로드 전환 — 썸네일에 한정한다.
- 기존 등록된 템플릿의 카테고리 값 마이그레이션(데이터 백필) — 별도 이슈로 다룬다.
- 이미지 리사이즈/압축/포맷 변환.
- 템플릿 수정(update) 화면에서의 동일 변경 반영 — 이번 PRD는 생성(create) 플로우로 한정한다. 수정 플로우는 `docs/templates/feature/update` 대상.

## 용어 정의

[spec-fixed.md](./spec-fixed.md)의 Ubiquitous Language를 그대로 따른다. 추가되는 용어:

| 용어                          | 정의                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| 썸네일 버킷(thumbnail bucket) | 템플릿 썸네일 이미지를 저장하는 Supabase Storage public 버킷 |
