// 사진작가 포트폴리오 템플릿에서 사용하는 공용 타입 모음.
// Sandpack 샌드박스 안에서 실행되므로 외부 패키지 타입은 쓰지 않는다.

/** 콘택트시트 스와치(사진 대체 그라디언트 박스) 한 장의 정보 */
export interface FilmSwatch {
  /** 필름 롤 프레임 번호처럼 보이는 라벨 (예: '#014A') */
  frameNumber: string;
  /** 촬영 장소 또는 주제 캡션 */
  caption: string;
  /** CSS 그라디언트 문자열 */
  gradient: string;
}

/** Skill 섹션 카드 하나 */
export interface SkillGroup {
  title: string;
  items: string[];
}

/** Project 섹션 카드 하나 */
export interface ProjectItem {
  swatch: FilmSwatch;
  title: string;
  description: string;
  year: string;
}

/** Career 섹션 타임라인 항목 하나 */
export interface CareerItem {
  year: string;
  title: string;
  description: string;
}
