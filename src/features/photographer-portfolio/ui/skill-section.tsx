import type { SkillGroup } from '../model/types';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './design-tokens';

const SKILL_GROUPS: SkillGroup[] = [
  {
    title: '촬영 장비',
    items: [
      'Leica M6 (필름)',
      'Mamiya RB67 (중형 필름)',
      'Fujifilm X-T5 (디지털 서브)',
      'Kodak Portra 400/800',
    ],
  },
  {
    title: '후반 작업',
    items: [
      '자가 암실 현상·인화',
      'Epson V850 필름 스캔',
      'Capture One 색보정',
      'Adobe Lightroom 카탈로그 관리',
    ],
  },
  {
    title: '촬영 장르',
    items: ['도시 재개발 다큐멘터리', '전통시장 인물 기록', '골목 풍경', '흑백 아카이브 사진'],
  },
];

/** Skill 섹션. 장비/후반작업/장르 3열 카드 그리드로 구성한다. */
export function SkillSection() {
  return (
    <section
      aria-labelledby="skill-heading"
      style={{
        padding: '56px 40px',
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
      }}
    >
      <h2
        id="skill-heading"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '28px',
          margin: '0 0 28px',
          borderBottom: `2px solid ${COLORS.terracotta}`,
          paddingBottom: '10px',
          display: 'inline-block',
        }}
      >
        Skill
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {SKILL_GROUPS.map((group) => (
          <div
            key={group.title}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.copper}`,
              borderRadius: '4px',
              padding: '20px',
            }}
          >
            <h3
              style={{
                fontFamily: FONT_MONO,
                fontSize: '13px',
                letterSpacing: '0.08em',
                color: COLORS.copperText,
                margin: '0 0 14px',
                textTransform: 'uppercase',
              }}
            >
              {group.title}
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: '18px',
                fontFamily: FONT_BODY,
                fontSize: '15px',
                lineHeight: 1.9,
              }}
            >
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
