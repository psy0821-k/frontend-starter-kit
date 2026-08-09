# Routing Structure

이 문서는 Frontend Starter Platform의 라우팅 구조와 각 메뉴의 역할을 설명합니다.

프로젝트를 구현하거나 새로운 기능을 추가하기 전에 반드시 이 문서를 참고하여 라우팅의 목적을 이해한 후 작업을 진행해주세요.

---

# 프로젝트 철학

이 프로젝트는 하나의 완성된 웹사이트를 제공하는 것이 아니라,

**Starter + Template + Feature를 조합하여 다양한 프로젝트를 빠르게 구축할 수 있는 Frontend Starter Platform**입니다.

따라서 각 라우트는 서로 다른 역할을 가집니다.

---

# Routing Tree

```text
/
├── starters
│   ├── portfolio
│   ├── shopping
│   └── erp
│
├── templates
│   ├── login
│   ├── dashboard
│   └── detail
│
├── features
│
├── auth
│   ├── login
│   ├── register
│   ├── forgot-password
│   ├── reset-password
│   └── verify-email
│
└── about
```

---

# Route Description

## /

서비스의 메인 페이지입니다.

Starter Platform의 소개와 주요 기능을 안내하며,
사용자가 Starter, Template, Feature를 탐색할 수 있는 시작점입니다.

---

## /starters

Starter는 프로젝트의 시작점(Main Page)입니다.

각 Starter는 하나의 프로젝트 컨셉을 대표하며,
사용자는 원하는 Starter를 선택하여 프로젝트를 시작합니다.

예시

- Portfolio Starter
- Shopping Starter
- ERP Starter

Starter는 프로젝트의 메인 화면과 기본 구조를 제공합니다.

> Starter는 프로젝트 단위이며, 페이지 모음이 아닙니다.

---

## /templates

Template는 프로젝트에서 재사용 가능한 페이지입니다.

Starter와 독립적으로 존재하며,
필요한 페이지를 선택하여 Starter에 추가할 수 있습니다.

예시

- Login
- Dashboard
- Detail

Template는 하나의 화면(UI)을 의미합니다.

> 하나의 Template는 여러 Starter에서 함께 사용할 수 있습니다.

### 하위 경로

| 경로              | 설명                                      | 접근 권한    |
| ----------------- | ----------------------------------------- | ------------ |
| `/templates`      | 전체 목록 (검색·카테고리 필터·무한스크롤) | 공개         |
| `/templates/new`  | 템플릿 등록                               | **관리자만** |
| `/templates/[id]` | 상세 — 등록일/수정일, 파일별 코드 뷰어    | 공개         |

`/templates/new`는 공개 카탈로그와 같은 네임스페이스에 있지만 관리자 전용입니다.
페이지 진입 시 `requireAdmin()`으로 막고, 권한이 없으면 403이 아니라 **404**를
반환합니다(403은 관리자 페이지의 존재를 누설합니다).

> **주의**: `new`는 `[id]`보다 우선 매칭되므로 예약어입니다. 나중에 id를 slug로
> 바꾸면 "new"라는 이름의 템플릿을 만들 수 없습니다.
> `features/starter-kit/model/constants.ts`의 `RESERVED_TEMPLATE_SLUGS`를 참조하세요.

---

## /features

Feature는 프로젝트에 추가할 수 있는 기능입니다.

예시

- Search
- Board
- Comment
- Payment
- Notification

Feature는 특정 페이지에 종속되지 않으며,
필요한 Starter 또는 Template에 자유롭게 조합할 수 있습니다.

---

## /auth

인증(Authentication) 관련 페이지입니다.

현재 제공되는 기능

- Login
- Register
- Forgot Password
- Reset Password
- Verify Email

Auth는 인증 기능만을 관리하는 독립적인 영역입니다.

---

## /about

프로젝트 소개 페이지입니다.

프로젝트의 목적, 철학, 기술 스택 등을 안내합니다.

---

# 구현 원칙

새로운 페이지를 추가하기 전에 아래 기준을 확인합니다.

### Starter인가?

- 프로젝트의 메인 화면인가?
- 프로젝트의 시작점인가?

→ 그렇다면 Starter입니다.

---

### Template인가?

- 하나의 화면(UI)인가?
- 다른 프로젝트에서도 재사용 가능한가?

→ 그렇다면 Template입니다.

---

### Feature인가?

- 특정 기능인가?
- 여러 페이지에서 재사용 가능한가?

→ 그렇다면 Feature입니다.

---

# 가장 중요한 원칙

Starter, Template, Feature는 서로 다른 역할을 가지며 혼합하지 않습니다.

- Starter = 프로젝트의 시작점(Main)
- Template = 재사용 가능한 페이지(UI)
- Feature = 재사용 가능한 기능(Module)

모든 구현은 이 구조를 기준으로 진행합니다.
