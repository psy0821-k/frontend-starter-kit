# 마이페이지 — 초기 아이디어

## 배경

`plan/prd.md`의 인증 로드맵(resend → 회원가입/로그인 테스트 → Google 소셜 로그인)이
마무리된 이후 다음 단계로 진행. 로그인한 사용자가 자신의 계정 정보와 활동(북마크)을
확인할 수 있는 공간이 필요하다.

## 라우트 위치

`/mypage` — 최상위 독립 경로. `docs/routing.md`의 Starter/Template/Feature 3분류에는
속하지 않으며, `/auth`와 같은 레벨의 별도 영역으로 취급한다.

## MVP 범위 (1차 결정)

- 프로필 정보 표시 (닉네임, 이메일)
- 내가 북마크한 template/feature 모아보기

## 참고

- 북마크 기능은 이미 구현되어 있음(`src/features/bookmark/`, `public.bookmarks` 테이블).
  마이페이지의 "내 북마크" 탭은 이 기존 데이터를 조회하는 화면이다.
- 인증은 이메일/비밀번호 + Google OAuth 둘 다 지원되며, 로그인 세션은
  `getCurrentUser()`(`src/shared/api/auth/get-current-user.ts`)로 조회 가능.
