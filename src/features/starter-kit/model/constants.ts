/**
 * /templates/[id]의 동적 세그먼트로 쓸 수 없는 값.
 *
 * 등록 페이지가 /templates/new에 있으므로 Next.js는 정적 세그먼트 'new'를
 * 동적 [id]보다 우선 매칭한다. id가 UUID인 현재는 충돌하지 않지만, 나중에
 * slug(예: /templates/login-form)로 바꾸면 'new'라는 이름의 템플릿을 만들 수
 * 없게 된다. slug 도입 시 이 목록을 등록 검증에 사용한다.
 */
export const RESERVED_TEMPLATE_SLUGS = ['new'] as const;

/** 파일 확장자 → 코드 뷰어에 표시할 언어 라벨의 기본값. */
export const DEFAULT_CODE_LANGUAGE = 'plaintext';
