// 리프넥서스(LeafNexus) 영업 대시보드 디자인 토큰
// 조경·원예 자재 B2B 유통사의 CRM이라는 도메인 특성을 반영해
// "성장/관계"를 은유하는 딥그린 + 앰버(계약 성사) 조합을 사용한다.
// 회색조 위주의 전형적인 관리자 패널 팔레트를 의도적으로 피했다.

export const colors = {
  // 배경
  forestDeep: '#0F3324', // 최상단 헤더, 사이드 네비 배경
  forestPanel: '#153A2B', // 사이드 네비 하위 패널
  ivory: '#F4EFE6', // 메인 콘텐츠 배경, 카드 배경
  ivorySoft: '#FBF9F4', // 카드 내부 옅은 구획

  // 액센트
  amber: '#C98A3B', // 계약 성사, 주요 CTA, 긍정 지표
  amberSoft: '#E7C892', // 앰버 계열 배경 처리용
  sage: '#7FAE8C', // 보조 포인트, 신규 리드
  vermilion: '#B3401E', // 경고/미승인 (배경 대비 확보를 위해 어둡게 조정)
  vermilionBg: '#FBE4DB', // 경고 배경

  // 텍스트
  textOnDark: '#F4EFE6', // 다크 배경 위 텍스트
  textOnDarkMuted: '#B9CDBF', // 다크 배경 위 보조 텍스트
  textPrimary: '#1D2B22', // 라이트 배경 위 본문
  textSecondary: '#54604F', // 라이트 배경 위 보조 텍스트
  textMuted: '#5C665A', // 라이트 배경 위 캡션 (WCAG AA 4.5:1 이상 확보)

  border: '#DCD4C2', // 카드/테이블 경계선
  borderDark: '#2A4B3A', // 다크 영역 경계선
} as const;

export const typography = {
  display: `Georgia, 'Times New Roman', serif`, // 계약서·문서 느낌의 신뢰감 있는 디스플레이체
  body: `'Segoe UI', system-ui, -apple-system, sans-serif`, // 가독성 높은 본문체
  data: `'Consolas', 'SFMono-Regular', Menlo, monospace`, // 숫자 정렬용 모노스페이스(KPI, 금액)
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 14,
} as const;

export const shadow = {
  card: '0 1px 3px rgba(15, 51, 36, 0.08), 0 1px 2px rgba(15, 51, 36, 0.06)',
  panel: '0 4px 16px rgba(15, 51, 36, 0.12)',
} as const;
