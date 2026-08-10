// 디자이너 단계에서 정한 토큰을 코드 값으로 옮긴 파일.
// Sandpack에서는 Tailwind/CSS 변수 파일을 못 쓰므로, 인라인 style에서
// 그대로 spread할 수 있는 상수 객체로 정의한다.

export const COLORS = {
  paper: '#EDE7DA', // 필름 인화지 베이지 (배경)
  ink: '#2B2620', // 세피아 블랙 (텍스트/헤더)
  copper: '#8A5A3B', // 구리/시나몬 브라운 (배경/보더 등 비텍스트 강조용 — 밝은 배경 위 텍스트로는 대비 부족)
  copperText: '#6B4529', // copper의 텍스트 대비 강화 버전. 밝은 배경(paper/card) 위 본문 텍스트에 사용 (AA 이상)
  terracotta: '#C9622C', // 테라코타 오렌지 (시그니처 액센트, 작은 텍스트에는 굵게/큰 사이즈로만 사용)
  olive: '#5C6650', // 올리브 그린 (보조 텍스트, AA 통과)
  card: '#F7F4EC', // 카드 배경
} as const;

export const FONT_DISPLAY = "Georgia, 'Noto Serif KR', serif";
export const FONT_BODY =
  "'Pretendard', -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif";
export const FONT_MONO = "'Courier New', Courier, monospace";
