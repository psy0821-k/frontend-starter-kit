# src/features/starter-kit — 템플릿(스타터 킷) 도메인

## 도메인 용어

- **StarterKit**: `/templates` 목록·상세가 다루는 자산. DB 테이블명은 `templates`이고
  타입/폴더명은 `starter-kit`으로 남아 있다(기존 명명). 같은 대상이다.
- **TemplateFile**: 템플릿을 구성하는 파일 하나. `file_path` + `code` + `language` + `sort_order`.
- **Feature**: 아직 미구현. Template과 **별도 테이블**(`features`/`feature_files`)로 갈 예정이며,
  이미지가 없고 category 축도 다르다. 코드 뷰어(`starter-kit-code-viewer.tsx`)는
  Feature에서도 그대로 재사용할 수 있게 설계되어 있다.

## 대표 구현 (패턴 참조용)

| 목적                     | 파일                               |
| ------------------------ | ---------------------------------- |
| 폼 작성                  | `ui/template-register-form.tsx`    |
| 반복 필드(useFieldArray) | `ui/template-file-field-array.tsx` |
| 서버 데이터 조회         | `api/get-starter-kit-by-id.ts`     |
| BFF 호출                 | `api/create-template.ts`           |

## 규칙

### file_path

전체 경로를 한 필드에 담는다(`src/features/auth/ui/login-form.tsx`).
폴더와 파일명을 두 필드로 쪼개지 않는다 — 항상 붙여 쓰고 따로 조회할 일이 없어
조합·검증 코드만 늘어난다. 표시할 때만 `lib/split-file-path.ts`로 나눈다.

`(template_id, file_path)`에 UNIQUE 제약이 있다. 폼에서도 `superRefine`으로 미리
잡아 어느 행이 중복인지 짚어준다.

### language

사용자에게 입력받지 않는다. `lib/get-language-from-path.ts`가 확장자에서 추론한다
(`.tsx` 파일에 `python`을 고를 자유만 주기 때문). 단 값은 DB에 저장해 추론 규칙이
바뀌어도 과거 데이터가 흔들리지 않게 한다.

### sort_order

입력 순서를 그대로 표시 순서로 쓴다. 파일 경로 알파벳순은 "보여주고 싶은
순서"(진입점 먼저)와 다르다.

### 배열 필드와 `useAppForm`

`useAppForm`은 `ZodType<T, T>`를 요구해 스키마에서 `.transform()` / `.default()` /
`z.coerce`를 쓸 수 없다. 따라서:

- `tags` / `features` / `tech_stack` / `preview_images`는 **폼에서 콤마 구분 문자열**로 받고,
  `string[]` 변환은 제출 직전 `lib/to-create-input.ts`가 담당한다.
- `z.array(z.object(...))`는 입력/출력 타입이 같아 제약에 걸리지 않으므로 `files`는 배열 그대로 둔다.
- 초기값은 `.default()` 대신 `useAppForm`의 `defaultValues`로 준다.
- **제네릭을 명시**해야 한다(`useAppForm<TemplateFormValues>(...)`). T가 무공변 위치라
  추론에 맡기면 `z.enum`의 리터럴 유니온이 `string`으로 넓어져 `Control` 타입이 어긋난다.

`useAppForm` 자체는 수정하지 않는다 — auth 전체가 의존하는 공용 지점이다.

### 조회 계층

- 목록(`get-starter-kits.ts`)은 `template_files`를 **조인하지 않는다** — 카드가 코드를 쓰지 않는다.
- 상세(`get-starter-kit-by-id.ts`)만 임베딩으로 파일을 함께 가져온다(단일 요청, N+1 없음).
- 둘 다 Supabase 미설정 시 mock으로 폴백한다. 스키마 적용 전에도 화면을 확인할 수 있어야 한다.

### 코드 뷰어

- 활성 파일의 패널만 렌더링한다. 모든 패널을 두면 Base UI가 전환 애니메이션 종료를
  기다리는데, 이 프로젝트는 패널에 transition이 없어 `transitionend`가 발생하지 않고
  비활성 패널이 계속 보인다.
- 세로 탭은 `shared/ui/vertical-tabs.tsx`를 쓴다. shadcn의 `Tabs`는 `orientation`을
  Base UI Root에 전달하지 않아 키보드 방향이 화면 방향과 어긋난다.
- 문법 하이라이팅은 넣지 않았다. 코드가 DB에서 오는 런타임 입력이라
  `dangerouslySetInnerHTML`이 필요해지는데, React가 텍스트로 이스케이프하게 두면
  XSS 표면이 0이 된다. 나중에 넣더라도 스키마 변경 없이 추가할 수 있다.

### 권한

등록/수정/삭제는 관리자만 가능하다. `shared/api/auth/require-admin.ts`를 쓴다.
단 이 검사는 편의이고 **최종 방어선은 DB의 RLS**다 — anon key가 브라우저에
노출되므로 API를 우회한 직접 호출을 애플리케이션 코드로는 막을 수 없다.

권한 없음에 403이 아니라 404를 쓴다. 403은 "그 리소스는 존재하지만 당신 것이
아니다"를 누설하며, RLS가 행을 숨겨 "0 rows"가 되는 실제 동작과도 어긋난다.
