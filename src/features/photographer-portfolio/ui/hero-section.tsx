import { FilmSwatchBox } from './film-swatch';
import { COLORS, FONT_DISPLAY, FONT_MONO } from './design-tokens';

/**
 * 히어로 섹션. 풀블리드 슬라이드쇼 클리셰 대신 콘택트시트 한 컷 + 타이포를
 * 좌우로 배치해 "다큐멘터리 사진가의 필름 아카이브를 펼친 느낌"을 낸다.
 */
export function HeroSection() {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '32px',
        padding: '64px 40px 56px',
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        alignItems: 'center',
      }}
    >
      <div style={{ flex: '1 1 240px', maxWidth: '280px' }}>
        <FilmSwatchBox
          swatch={{
            frameNumber: '#001A',
            caption: '재개발 직전, 창신동 골목',
            gradient: 'linear-gradient(160deg, #8A5A3B 0%, #4A3A2A 55%, #2B2620 100%)',
          }}
        />
      </div>

      <div style={{ flex: '2 1 360px' }}>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '13px',
            letterSpacing: '0.15em',
            color: COLORS.copperText,
            margin: '0 0 12px',
          }}
        >
          DOCUMENTARY PHOTOGRAPHER — SEOUL, KOREA
        </p>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.15,
            margin: '0 0 16px',
            letterSpacing: '0.01em',
          }}
        >
          서한나
          <br />
          Seo Hanna
        </h1>
        <p
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '18px',
            fontStyle: 'italic',
            color: COLORS.copperText,
            maxWidth: '480px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          사라지기 전의 풍경을 필름에 담습니다. 재개발 지역과 전통시장, 골목의 마지막 모습을 10년째
          기록하는 다큐멘터리 사진가입니다.
        </p>
      </div>
    </header>
  );
}
