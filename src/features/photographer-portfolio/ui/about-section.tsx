import { FilmSwatchBox } from './film-swatch';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './design-tokens';

/** About Me 섹션. 2단 텍스트와 연락처 배지 역할의 작은 스와치를 함께 배치한다. */
export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      style={{
        padding: '56px 40px',
        backgroundColor: COLORS.card,
        color: COLORS.ink,
      }}
    >
      <h2
        id="about-heading"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '28px',
          margin: '0 0 28px',
          borderBottom: `2px solid ${COLORS.terracotta}`,
          paddingBottom: '10px',
          display: 'inline-block',
        }}
      >
        About Me
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
        }}
      >
        <div
          style={{ flex: '2 1 360px', fontFamily: FONT_BODY, fontSize: '16px', lineHeight: 1.8 }}
        >
          <p style={{ margin: '0 0 16px' }}>
            2014년부터 서울 재개발 예정지와 전통시장을 중심으로 &lsquo;사라지는 동네&rsquo; 연작을
            촬영하고 있습니다. 화려한 연출보다 그 자리에 있던 사람과 흔적을 있는 그대로 기록하는
            것을 원칙으로 삼습니다.
          </p>
          <p style={{ margin: 0 }}>
            필름 카메라의 느린 촬영 방식이 다큐멘터리의 태도와 닮았다고 믿습니다. 한 컷을 위해
            며칠을 같은 골목에서 머무르고, 인화 과정에서도 디지털 보정 대신 암실 노하우를
            우선합니다.
          </p>
        </div>

        <div style={{ flex: '1 1 180px', maxWidth: '200px' }}>
          <FilmSwatchBox
            aspectRatio="1 / 1"
            swatch={{
              frameNumber: '#002B',
              caption: '작업실, 필름 정리 중',
              gradient: 'linear-gradient(135deg, #5C6650 0%, #3A4032 100%)',
            }}
          />
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '12px',
              color: COLORS.olive,
              marginTop: '10px',
              lineHeight: 1.6,
            }}
          >
            SEOUL, KOREA
            <br />
            hanna.seo.photo@example.com
          </p>
        </div>
      </div>
    </section>
  );
}
