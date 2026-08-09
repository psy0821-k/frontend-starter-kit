# 템플릿 삭제 기능 — 이슈 분해

PRD([prd.md](./prd.md)) 기준. 확인 다이얼로그 UI와 Storage 정리 백엔드는 서로 의존적이라(둘 다 있어야 "삭제하면 실제로 정리된다"는 관찰 가능한 동작이 완성됨) 레이어로 쪼개지 않고 하나의 수직 슬라이스로 묶는다.

---

## 이슈 1 — 템플릿 삭제 기능 구현 (확인 다이얼로그 + Storage 정리)

### 설명

관리자가 상세 페이지에서 템플릿을 삭제할 수 있도록 확인 다이얼로그 UI를 추가하고, 삭제 시 DB 행뿐 아니라 Storage에 업로드된 썸네일 파일도 함께 정리하도록 백엔드를 확장한다. PRD 결정 1(AlertDialog 신규 추가), 결정 2(URL 파싱으로 Storage 경로 역산)를 반영한다.

### 변경 지점

- `src/components/ui/alert-dialog.tsx` — shadcn AlertDialog 원본 신규 추가(Base UI 기반, `dialog.tsx`와 동일 패턴)
- `src/features/starter-kit/ui/delete-template-dialog.tsx` — 삭제 확인 다이얼로그 신규 추가(삭제 API 호출·에러 표시·완료 후 라우팅 전담). `shared/ui`가 아니라 도메인 `ui/`에 배치했다 — "삭제"에 특화된 정책이라 아직 2번째 재사용처가 없는 시점에는 승격하지 않는다("2회 규칙", PRD 결정 1 참조)
- `src/features/starter-kit/lib/get-thumbnail-storage-path.ts` — `thumbnail_url`에서 Storage 경로를 역산하는 순수 함수 신규 추가
- `src/app/api/templates/[id]/route.ts`의 `DELETE` — 템플릿 조회 시 `thumbnail_url` 포함, Storage 삭제 시도 후(성공 여부 무관) 기존 삭제 로직 실행
- `src/features/starter-kit/api/delete-template.ts` — `DELETE /api/templates/[id]` 호출 클라이언트 함수 신규 추가
- `src/app/templates/[id]/page.tsx` — "수정" 버튼 옆에 관리자 전용 "삭제" 버튼과 확인 다이얼로그 연결

### Acceptance Criteria

- [x] Given 관리자가 템플릿 상세 페이지에 접속했을 때, When 화면을 보면, Then "수정" 버튼 옆에 "삭제" 버튼이 표시된다.
- [x] Given 관리자가 아닌 사용자가 상세 페이지에 접속했을 때, When 화면을 보면, Then "삭제" 버튼이 표시되지 않는다.
- [x] Given 관리자가 "삭제" 버튼을 눌렀을 때, When 클릭하면, Then 삭제를 확인하는 다이얼로그가 표시되고 아직 삭제되지 않는다.
- [x] Given 확인 다이얼로그가 열려 있을 때, When 관리자가 "취소"를 누르면, Then 다이얼로그가 닫히고 템플릿은 그대로 상세 페이지에 남아 있다.
- [x] Given 확인 다이얼로그가 열려 있을 때, When 관리자가 삭제를 확정하면, Then 템플릿 목록(`/templates`) 페이지로 이동하고 해당 템플릿이 더 이상 목록에 보이지 않는다.
- [x] Given 썸네일이 업로드된 템플릿을 삭제했을 때, When 삭제가 완료되면, Then Storage의 `template-thumbnails` 버킷에서 해당 썸네일 파일도 함께 삭제된다.
- [x] Given 삭제된 템플릿의 상세 페이지 URL로 직접 접속했을 때, When 페이지가 로드되면, Then 404가 표시된다.
- [x] Given 삭제 요청이 서버 에러로 실패했을 때, When 에러가 발생하면, Then 다이얼로그가 닫히지 않고 에러 메시지가 표시된다. (코드 로직으로 검증 — `catch` 블록에서 다이얼로그를 닫지 않고 에러 메시지를 표시함)

### 의존성

없음 — 백엔드(DELETE API)가 이미 존재해 확장만 필요하며, 프런트엔드 신규 컴포넌트와 함께 하나의 슬라이스로 완결된다.

### 상태

구현 및 브라우저 검증 완료 (2026-08-10). 실제 등록된 템플릿(`ERP 관리자 대시보드 스타터`)으로 삭제 확인 → 취소 유지 → 삭제 확정 → 목록 반영 → DB 행 삭제 → Storage 썸네일 파일 삭제 → 상세 페이지 404까지 end-to-end 확인함.
