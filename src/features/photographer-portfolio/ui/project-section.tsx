import type { ProjectItem } from '../model/types';
import { FilmSwatchBox } from './film-swatch';
import { COLORS, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './design-tokens';

const PROJECTS: ProjectItem[] = [
  {
    swatch: {
      frameNumber: '#014A',
      caption: '창신동 봉제골목, 철거 전 마지막 여름',
      gradient: 'linear-gradient(150deg, #C9622C 0%, #8A5A3B 45%, #2B2620 100%)',
    },
    title: '사라지는 동네: 창신동',
    description:
      '봉제공장이 밀집했던 창신동 골목이 재개발로 철거되기 전 2년간 기록한 연작. 작업하던 이들의 손과 공간을 흑백 필름으로 담았다.',
    year: '2019–2021',
  },
  {
    swatch: {
      frameNumber: '#022C',
      caption: '남대문 새벽시장, 경매 전 풍경',
      gradient: 'linear-gradient(150deg, #5C6650 0%, #3A4032 50%, #2B2620 100%)',
    },
    title: '새벽시장 사람들',
    description:
      '남대문·경동시장 새벽 경매 시간대를 밀착 취재한 다큐멘터리. 상인들의 하루가 시작되는 순간을 중형 필름으로 촬영했다.',
    year: '2020',
  },
  {
    swatch: {
      frameNumber: '#031F',
      caption: '을지로 노포, 마지막 영업일',
      gradient: 'linear-gradient(150deg, #8A5A3B 0%, #C9622C 40%, #5C6650 100%)',
    },
    title: '을지로 노포 아카이브',
    description:
      '3대째 이어온 을지로 인쇄골목 노포들의 폐업 전 마지막 모습을 기록한 아카이브 프로젝트. 지역 신문에 6회 연재되었다.',
    year: '2022',
  },
  {
    swatch: {
      frameNumber: '#040B',
      caption: '경의선 폐선 부지, 겨울',
      gradient: 'linear-gradient(150deg, #2B2620 0%, #5C6650 55%, #EDE7DA 100%)',
    },
    title: '폐선 위의 계절',
    description:
      '용도 폐기된 경의선 철길 주변 마을의 사계절을 1년간 정기적으로 방문해 기록한 개인 장기 프로젝트.',
    year: '2023–2024',
  },
];

/**
 * Project 섹션. 콘택트시트 느낌을 살리기 위해 비대칭 그리드로 배치한다
 * (첫 프로젝트는 크게, 나머지 세 개는 작게).
 */
export function ProjectSection() {
  const [featured, ...rest] = PROJECTS;

  return (
    <section
      aria-labelledby="project-heading"
      style={{
        padding: '56px 40px',
        backgroundColor: COLORS.card,
        color: COLORS.ink,
      }}
    >
      <h2
        id="project-heading"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '28px',
          margin: '0 0 28px',
          borderBottom: `2px solid ${COLORS.terracotta}`,
          paddingBottom: '10px',
          display: 'inline-block',
        }}
      >
        Project
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1.2fr) 1fr',
          gap: '28px',
        }}
      >
        <ProjectCard item={featured} large />

        <div style={{ display: 'grid', gap: '24px' }}>
          {rest.map((item) => (
            <ProjectCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ item, large = false }: { item: ProjectItem; large?: boolean }) {
  return (
    <article style={{ display: 'flex', gap: '16px', flexDirection: large ? 'column' : 'row' }}>
      <div style={{ width: large ? '100%' : '120px', flexShrink: 0 }}>
        <FilmSwatchBox swatch={item.swatch} aspectRatio={large ? '3 / 2' : '1 / 1'} />
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT_MONO,
            fontSize: '12px',
            color: COLORS.copperText,
            margin: '0 0 4px',
          }}
        >
          {item.year}
        </p>
        <h3
          style={{ fontFamily: FONT_DISPLAY, fontSize: large ? '22px' : '17px', margin: '0 0 8px' }}
        >
          {item.title}
        </h3>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '14px',
            lineHeight: 1.7,
            margin: 0,
            color: COLORS.ink,
          }}
        >
          {item.description}
        </p>
      </div>
    </article>
  );
}
