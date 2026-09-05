# /starters 라우트 신설 — spec-fixed

로드맵 1단계 "커널/라우팅 구조 정리"의 남은 작업. `docs/routing.md`가 정의한
Starter/Template/Feature 3분류 중 `/starters`가 아직 라우트로 구현되지 않은 상태를
해소한다.

## 배경 조사 결과 (인터뷰 전 확인한 사실)

- `photographer-portfolio`(id: `ef686de6-5f51-4efc-943d-249f9a0f2202`), `devops-portfolio`
  (id: `d99b3223-377e-481f-b04b-e038eaf3f571`)는 이미 `/templates` DB에 등록되어
  실사용 가능한 상태다. SQL로 재확인 완료.
- `sales-crm-dashboard`는 `/templates` DB에 등록되어 있지 않다(제목 기준 검색 0건).
- `portfolio-landing`도 `/templates` DB에 없는 유일한 콘텐츠다.
- 따라서 이번 스코프에서 `/starters`로 조립할 콘텐츠는 **portfolio-landing,
  sales-crm-dashboard 2개**로 한정한다. photographer/devops-portfolio를 추가로
  스타터에 조립하면 동일 콘텐츠가 `/templates`와 `/starters` 양쪽에 존재하게 되어
  `docs/routing.md`의 "Starter/Template/Feature는 혼합하지 않는다" 원칙에 위배된다.
- `src/features/landing/`(서비스 루트 `/` 랜딩페이지용, 비디오·웨이브 애니메이션)은
  로컬의 별도 브랜치(`feature/landing-page` ref, 커밋 3ff67b1 등)에만 존재하고
  현재 작업 브랜치·`main` 어디에도 병합되어 있지 않다. 이 작업과 무관하므로
  범위에서 완전히 제외한다.

## 용어 정의

| 용어            | 의미                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| Starter         | `/starters/[slug]`로 노출되는, 프로젝트의 시작점(메인 화면) 성격의 완성된 데모 페이지 |
| slug            | Starter를 식별하는 정적 문자열 키. DB id가 아니라 코드에 하드코딩된 값                |
| 스타터 카탈로그 | `/starters` 목록 페이지에서 보여주는 스타터 메타데이터 배열(정적, 코드 내 상수)       |

## 확정된 결정 사항

1. **스코프**: `/starters` 목록 페이지 + `/starters/[slug]` 상세 라우트 2개
   (portfolio, erp)를 이번에 함께 구현한다. 상세만 만들면 진입 경로가 없어
   도달 불가능한 라우트가 되므로 목록도 포함한다.
2. **데이터 소스**: DB 테이블을 신설하지 않는다. 스타터가 2종뿐인 현재 단계에서
   DB화는 과설계(YAGNI 위반)다. `/templates`의 "2회 규칙"과 동일하게, 스타터가
   3개 이상으로 늘어 실제 관리 부담이 생기는 시점에 DB 전환을 재검토한다.
   목록/상세에 필요한 메타데이터(title, summary, slug, 대표 이미지 등)는
   `src/features/starter-kit-catalog/model/starters.ts` 같은 정적 상수 배열로 관리한다.
3. **slug 매핑**:
   - `portfolio-landing` → slug `portfolio`
   - `sales-crm-dashboard` → slug `erp` (콘텐츠가 "영업관리 ERP 대시보드"이며
     `docs/routing.md` 예시의 ERP Starter와 일치)
4. **접근 권한 및 상호작용**: 북마크 버튼, 관리자 수정/삭제 기능을 포함하지 않는다.
   Starter는 DB 엔티티가 아니므로 "수정/삭제" 개념이 성립하지 않고, 북마크는
   현재 `targetType: 'template'`로만 설계되어 있어 확장하려면 스키마 변경이
   필요하다 — 이번 스코프의 Out of Scope으로 명시한다.
5. **렌더링 방식**: 두 콘텐츠 모두 이벤트 핸들러 없는 순수 정적 컴포넌트이므로
   서버 컴포넌트로 직접 렌더링한다(클라이언트 컴포넌트 전환 불필요).
   `portfolio-landing-page.tsx`는 named export, `dashboard-page.tsx`는 default
   export — 라우트 페이지에서 import 방식을 각각 맞춘다.

## 최소 동작 시나리오

1. 사용자가 `/starters`에 접속하면 portfolio, erp 두 스타터 카드(제목/한줄요약/
   바로가기)가 보인다.
2. 사용자가 `/starters/portfolio`에 접속하면 `PortfolioLandingPage`가 렌더링된다.
3. 사용자가 `/starters/erp`에 접속하면 `DashboardPage`(리프넥서스 영업관리
   대시보드)가 렌더링된다.
4. 존재하지 않는 slug(`/starters/unknown`)로 접속하면 404(`notFound()`)를 반환한다.

## Out of Scope (2단계 초안, PRD에서 최종 확정)

- `/starters`에 DB 테이블 신설
- 북마크·관리자 CRUD 기능
- photographer-portfolio, devops-portfolio의 스타터 중복 조립
- `src/features/landing/`(서비스 루트 랜딩페이지) 병합 작업
- 스타터 3종 이상 확장(쇼핑몰 등) — 현재는 2종만
