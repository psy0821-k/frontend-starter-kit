# Information Architecture

이 문서는 Frontend Starter Platform의 정보 구조(사이트맵)를 설명합니다.

각 페이지의 역할과 목적은 [routing.md](./routing.md)를 참고하고,
이 문서는 페이지 간 계층 구조와 진입 경로에 집중합니다.

시각화 다이어그램: https://claude.ai/code/artifact/37597b01-21cc-43ab-a5c6-282dcb39b360

---

# 사이트맵

```text
/ (메인)
│
├── /starters (목록)
│   ├── /starters/portfolio
│   ├── /starters/shopping
│   └── /starters/erp
│
├── /templates (목록)
│   ├── /templates/login
│   ├── /templates/dashboard
│   └── /templates/detail
│
├── /features (목록)
│
├── /auth
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/forgot-password
│   ├── /auth/reset-password
│   └── /auth/verify-email
│
└── /about
```

---

# 진입 경로

## /

모든 탐색의 시작점입니다.
`/starters`, `/templates`, `/features`, `/about`으로 진입할 수 있는 허브 역할을 합니다.

## /starters → /starters/[slug]

`/starters`는 Starter 목록이며, 각 항목을 선택하면 `/starters/[slug]`(예: `/starters/portfolio`)로 이동합니다.
`/starters/[slug]` 내부에서 필요한 Template, Feature를 조합해 하나의 프로젝트 화면을 구성합니다.

## /templates → /templates/[slug]

`/templates`는 Template 목록이며, 각 항목을 선택하면 `/templates/[slug]`(예: `/templates/login`)로 이동합니다.
Template는 특정 Starter에 종속되지 않으므로 `/starters` 하위가 아닌 최상위 라우트로 존재합니다.

## /features

Feature는 독립된 상세 페이지를 갖지 않고, Starter 또는 Template 내부에 조합되는 형태로 사용됩니다.
`/features`는 사용 가능한 Feature 목록만 제공합니다.

## /auth

`/starters/[slug]`, `/templates/[slug]` 등 인증이 필요한 화면에서 진입하는 독립 영역입니다.
`/auth` 하위 페이지는 다른 라우트와 계층 관계를 갖지 않습니다.

## /about

허브(`/`)에서만 진입하는 말단 페이지입니다.
