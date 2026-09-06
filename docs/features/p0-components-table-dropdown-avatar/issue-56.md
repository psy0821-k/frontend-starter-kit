# Issue #56 — feat(ui): Avatar + Dropdown-menu 원본 완성 및 헤더 적용

## 시그니처

### `src/components/ui/avatar.tsx`

`@base-ui/react/avatar` 기반. 기존 9종(`dialog.tsx`, `select.tsx`, `tabs.tsx`)과 동일하게
프리미티브를 얇게 감싸는 함수 컴포넌트 + `data-slot` 패턴을 따른다. CVA는 variant가 없어
불필요하므로 사용하지 않는다(과설계 방지 — `tabs.tsx`의 `tabsListVariants`는 실제로
`variant: default | line` 분기가 있어서 CVA를 쓴 것이고, Avatar는 분기가 없다).

```tsx
'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cn } from '@/shared/lib/cn';

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
```

- `AvatarFallback`은 `delayMs`(base-ui 기본 prop, 그대로 노출) 없이 즉시 렌더되어야
  이번 헤더 적용(이미지 없이 이니셜만 사용)에서 깜빡임 없이 보인다 — 헤더 사용처에서
  `AvatarFallback`에 `delayMs`를 넘기지 않는다(기본값 사용, 즉시 표시).
- `any` 미사용. 모든 Props는 `AvatarPrimitive.*.Props` 재사용(신규 타입 선언 없음).

### `src/components/ui/dropdown-menu.tsx`

`@base-ui/react/menu` 기반. `select.tsx`가 가장 최근(2026-08-09) 패턴이며 구조가
`Portal > Positioner > Popup`로 동일해 이를 그대로 따른다(`dialog.tsx`의
`Portal > Backdrop > Popup`은 모달용이라 배제).

```tsx
'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { cn } from '@/shared/lib/cn';

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'end',
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <DropdownMenuPortal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn('px-2 py-1.5 text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
```

- `DropdownMenuLabel`은 base-ui에 대응 프리미티브가 없어(메뉴 안 "닉네임 표시" 텍스트는
  상호작용 불가능한 라벨) `select.tsx`가 `SelectScrollUpButton` 등에서 하듯 일반
  `<div>` + `data-slot`으로 직접 구현한다. `any` 미사용.
- 키보드 화살표 이동/Esc 닫힘+포커스 복귀는 base-ui `Menu` 프리미티브 기본 동작이므로
  래퍼에서 별도 구현하지 않는다(AC 4, 5 커버).

### `src/app/_components/header.tsx` 수정

기존 "닉네임 표시 span + LogoutButton" 블록을 Avatar + DropdownMenu 조합으로 교체한다.
`UserMenu` 같은 별도 조합 컴포넌트는 만들지 않는다(PRD 결정 — 2회 규칙 미충족, 헤더가 직접 소유).

```tsx
{
  user ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={`${user.nickname}님 메뉴 열기`}
          />
        }
      >
        <Avatar>
          <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.nickname}님</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<div />}>
          {/* 로그아웃: 기존 LogoutButton의 로직을 그대로 트리거 */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link href="/auth/login" className={linkClassName}>
      로그인
    </Link>
  );
}
```

- "프로필" 항목은 별도 라우트 이동 없이 닉네임을 표시하는 `DropdownMenuLabel`로 구현한다
  (AC 원문 "프로필(닉네임 표시)"이 클릭 가능한 항목인지 정적 라벨인지 모호 — 좁고 보수적인
  해석을 택해 **정적 라벨**로 처리. 네비게이션의 "마이페이지" 링크가 이미 프로필 페이지
  이동을 담당하므로 중복 액션을 새로 만들지 않는다).
- "로그아웃" 항목은 기존 `LogoutButton`의 `handleClick` 로직을 재사용해야 하므로,
  `LogoutButton` 자체를 `DropdownMenuItem`의 `render` prop으로 넘기거나(가장 좁은 변경),
  `LogoutButton` 내부를 그대로 두고 `DropdownMenuItem`이 감싸는 형태 중 하나를 tdd-green
  단계에서 base-ui `render` prop 병합 동작(`mergeProps`)을 확인해 선택한다 — 이 결정은
  Stage 1(시그니처) 범위를 벗어나는 구현 세부사항이므로 시그니처 문서에는 "기존 로그아웃
  로직 재사용"까지만 고정한다.
- `getCurrentUser()`의 반환 타입(`CurrentUser { id: string; nickname: string }`)은
  변경하지 않는다.

## 에러 케이스

- 없음 — Avatar/DropdownMenu는 순수 UI 프리미티브 래퍼이며 별도의 실패 가능한 로직(API
  호출, 파싱 등)을 갖지 않는다. 로그아웃 실패 시 에러 처리는 기존 `LogoutButton`이
  이미 담당하며 이번 이슈에서 변경하지 않는다.

## 기존 테스트에 대한 영향 (참고)

- `src/app/_components/header.test.tsx`의 `'tester님'` 텍스트를 `screen.getByText`로
  직접 찾는 테스트(32~40행)는 헤더 구조 변경 후 실패할 수 있다. 이 이슈의 AC는 닉네임이
  드롭다운 안에 표시되도록 요구하므로, 해당 테스트는 tdd-green/refactor 단계에서 새 구조에
  맞게 업데이트가 필요하다(테스트 파일 수정은 이 문서의 범위가 아니라 구현 단계 소관).

## 테스트 시나리오

### `Avatar` / `AvatarFallback` (컴포넌트, `src/components/ui/avatar.tsx`)

- [정상] `AvatarFallback`에 자식으로 텍스트를 전달했을 때 그 텍스트가 화면에 표시되어야 한다
- [정상] `Avatar`에 `className`을 전달했을 때 기본 클래스와 병합되어 적용되어야 한다
- [경계] `AvatarImage`에 잘못된 `src`(로드 실패)가 주어졌을 때 `AvatarFallback`이 대신
  표시되어야 한다

### `DropdownMenu` 관련 컴포넌트 (`src/components/ui/dropdown-menu.tsx`)

- [정상] `DropdownMenuTrigger`를 클릭했을 때 `DropdownMenuContent`가 열려야 한다
- [정상] 열린 메뉴에서 `DropdownMenuItem`을 클릭했을 때 해당 항목의 `onClick` 핸들러가
  호출되어야 한다
- [경계] 열린 메뉴에서 화살표 키(ArrowDown/ArrowUp)를 눌렀을 때 포커스가 다음/이전
  `DropdownMenuItem`으로 이동해야 한다
- [경계] 열린 메뉴에서 Esc 키를 눌렀을 때 메뉴가 닫히고 포커스가 `DropdownMenuTrigger`로
  돌아와야 한다
- [예외] `DropdownMenuItem`에 `disabled`가 주어졌을 때 클릭해도 `onClick`이 호출되지
  않아야 한다

### `Header` (`src/app/_components/header.tsx`, 통합)

- [정상] 로그인한 사용자로 렌더링했을 때 헤더에 닉네임 첫 글자가 표시된 Avatar가
  보여야 한다 (AC 1)
- [정상] Avatar(드롭다운 트리거)를 클릭했을 때 "{닉네임}님"과 "로그아웃" 항목이 보이는
  드롭다운 메뉴가 열려야 한다 (AC 2)
- [정상] 드롭다운이 열린 상태에서 "로그아웃"을 클릭했을 때 기존과 동일하게
  `POST /api/auth/logout` 호출 후 `/auth/login`으로 리다이렉트되어야 한다 (AC 3)
- [정상] 로그인하지 않은 사용자로 렌더링했을 때 Avatar/드롭다운 없이 "로그인" 링크만
  보여야 한다 (기존 분기 유지 회귀 방지)
- [정상] 로그인 여부와 무관하게 "마이페이지" 네비게이션 링크가 항상 `/mypage`를
  가리켜야 한다 (기존 회귀 방지, header.test.tsx 22~~30행·42~~49행 유지)

## AC 커버리지

| AC                                                   | 커버 시나리오                                                                                                                                   |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 헤더에 닉네임 첫 글자 Avatar 표시                 | Header 시나리오 1번                                                                                                                             |
| 2. Avatar 클릭 시 드롭다운 열림("프로필"+"로그아웃") | DropdownMenu 시나리오 1번, Header 시나리오 2번                                                                                                  |
| 3. "로그아웃" 클릭 시 기존 로그아웃 동작 수행        | DropdownMenu 시나리오 2번, Header 시나리오 3번                                                                                                  |
| 4. 화살표 키로 메뉴 항목 간 포커스 이동              | DropdownMenu 시나리오 3번                                                                                                                       |
| 5. Esc 키로 메뉴 닫힘 + 트리거로 포커스 복귀         | DropdownMenu 시나리오 4번                                                                                                                       |
| 6. 모바일/태블릿/데스크톱 레이아웃 깨짐 없음         | `src/app/_components/header.e2e.ts` — 모바일(375px)/태블릿(768px)/데스크톱(1280px) 각 뷰포트별 2개 시나리오(Avatar 표시, 드롭다운 표시), 총 6개 |

AC 6은 유닛 테스트 시나리오로 커버되지 않는다 — 이 프로젝트의 컨벤션(`CLAUDE.md`)상
접근성/반응형 검증은 Playwright E2E의 실제 렌더링 기반으로 수행하며, 이번 이슈에도
동일 원칙을 적용한다.

### AC 6 — Playwright E2E 시나리오 (`src/app/_components/header.e2e.ts`)

로그인 상태 시뮬레이션은 새로운 방식을 발명하지 않고, `plan/test-accounts.md`의
기존 테스트 계정(`test01@example.com` / `TestPassword123!`, 로그인 페이지에도
안내되어 있음)으로 `/auth/login` 폼을 실제로 제출해 세션 쿠키를 발급받는 방식을
사용했다. 헤더가 서버 컴포넌트로 `getCurrentUser()`를 직접 호출하므로(별도
프로세스로 뜨는 Playwright 대상 서버에는 Vitest의 모듈 모킹이 적용되지 않음),
유닛 테스트(header.test.tsx)처럼 `getCurrentUser`를 모킹할 수 없어 실제 로그인이
유일한 방법이다.

뷰포트 3종(모바일 375px / 태블릿 768px / 데스크톱 1280px) × 시나리오 2종:

- **Avatar가 레이아웃 깨짐 없이 표시된다**: 로그인 후 헤더의 Avatar 트리거(`aria-label="{닉네임}님 메뉴 열기"`)가 보이고, 문서에 가로 스크롤이 발생하지 않으며(`scrollWidth <= clientWidth`), 트리거가 헤더 영역 안에 완전히 들어와 있는지(겹침/이탈 없음) 확인한다.
- **Avatar 클릭 시 드롭다운이 뷰포트 밖으로 벗어나지 않는다**: Avatar를 클릭해 메뉴(`role="menu"`)를 열고, 메뉴의 bounding box가 뷰포트 경계(0 ~ width/height) 안에 있는지, "로그아웃" 메뉴 항목이 보이는지 확인한다.

`npm run test:e2e`로 6개 시나리오 모두 통과 확인(레이아웃 버그 없음 — 기존
`avatar.tsx`/`dropdown-menu.tsx`/`header.tsx` 수정 없이 통과). 전체 E2E
suite(31개) 및 기존 유닛 테스트(250개) 회귀 없음.
