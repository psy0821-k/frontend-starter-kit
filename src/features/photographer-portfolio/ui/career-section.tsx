import type { CareerItem } from '../model/types';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './design-tokens';

const CAREER_ITEMS: CareerItem[] = [
  {
    year: '2024',
    title: '개인전 "폐선 위의 계절"',
    description: '서울 대안공간 마루, 경의선 폐선 부지 연작 개인전 개최.',
  },
  {
    year: '2023',
    title: '사진집 『을지로, 마지막 인화』 출판',
    description: '을지로 노포 아카이브 프로젝트를 엮은 독립출판 사진집. 초판 500부 완판.',
  },
  {
    year: '2022',
    title: '지역 신문 연재 "노포의 기억"',
    description: '을지로 노포 폐업 기록을 지역 신문에 6회 연재.',
  },
  {
    year: '2021',
    title: '단체전 "골목, 사라지다"',
    description: '서울시립미술관 신진작가 기획전 참여, 창신동 연작 3점 전시.',
  },
  {
    year: '2019',
    title: '다큐멘터리 사진 작업 시작',
    description: '창신동 봉제골목 재개발을 계기로 ‘사라지는 동네’ 연작 착수.',
  },
];

/** Career 섹션. 연도 세로선을 기준으로 전시·출판 이력을 타임라인으로 나열한다. */
export function CareerSection() {
  return (
    <section
      aria-labelledby="career-heading"
      style={{
        padding: '56px 40px 72px',
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
      }}
    >
      <h2
        id="career-heading"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '28px',
          margin: '0 0 32px',
          borderBottom: `2px solid ${COLORS.terracotta}`,
          paddingBottom: '10px',
          display: 'inline-block',
        }}
      >
        Career
      </h2>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: '640px' }}>
        {CAREER_ITEMS.map((item, index) => (
          <li
            key={item.year + item.title}
            style={{
              display: 'flex',
              gap: '20px',
              paddingBottom: index === CAREER_ITEMS.length - 1 ? 0 : '28px',
              borderLeft: `2px solid ${COLORS.copper}`,
              position: 'relative',
              paddingLeft: '24px',
              marginLeft: '4px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-7px',
                top: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: COLORS.terracotta,
                border: `2px solid ${COLORS.paper}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '14px',
                color: COLORS.copperText,
                flexShrink: 0,
                width: '52px',
              }}
            >
              {item.year}
            </span>
            <div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: '18px', margin: '0 0 4px' }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
