import type { CareerItem } from './types';

const CAREER_TIMELINE: CareerItem[] = [
  {
    year: '2023 - 현재',
    role: 'Senior DevOps Engineer',
    company: '클라우드 커머스 플랫폼',
    description:
      '멀티 리전 인프라와 SRE 문화 정착을 리드. 신규 입사자 온보딩 가이드와 장애 대응 런북을 정비했습니다.',
  },
  {
    year: '2021 - 2023',
    role: 'DevOps Engineer',
    company: '핀테크 스타트업',
    description:
      '트래픽이 10배 증가하는 구간에서 인프라 확장을 전담. 비용 최적화와 CI 파이프라인 표준화를 주도했습니다.',
  },
  {
    year: '2018 - 2021',
    role: 'Infrastructure Engineer',
    company: 'IT 서비스 기업',
    description:
      '온프레미스에서 AWS로의 마이그레이션에 참여하며 Terraform 기반 인프라 코드화를 처음 도입했습니다.',
  },
];

/**
 * Career 섹션 — 실제 시간순 이력이므로 수직 타임라인과 연도 라벨을 사용한다.
 */
export function CareerSection() {
  return (
    <section
      aria-labelledby="career-heading"
      style={{
        padding: '80px 48px 100px',
        backgroundColor: '#0F1626',
        color: '#E8ECF4',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h2
          id="career-heading"
          style={{
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            margin: '0 0 40px',
          }}
        >
          Career
        </h2>

        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {CAREER_TIMELINE.map((item, index) => (
            <li
              key={item.year}
              style={{
                display: 'flex',
                gap: '20px',
                paddingBottom: index < CAREER_TIMELINE.length - 1 ? '32px' : 0,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#5EEAD4',
                    boxShadow: '0 0 0 4px rgba(94, 234, 212, 0.15)',
                    marginTop: '4px',
                  }}
                />
                {index < CAREER_TIMELINE.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      width: '2px',
                      backgroundColor: '#232C42',
                      marginTop: '6px',
                    }}
                  />
                )}
              </div>

              <div style={{ paddingBottom: '8px' }}>
                <p
                  style={{
                    fontFamily: 'Consolas, "SF Mono", Menlo, monospace',
                    fontSize: '12px',
                    color: '#8993AE',
                    margin: '0 0 6px',
                  }}
                >
                  {item.year}
                </p>
                <h3
                  style={{
                    fontFamily: '"Segoe UI", Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: '17px',
                    margin: '0 0 4px',
                  }}
                >
                  {item.role}{' '}
                  <span style={{ color: '#8993AE', fontWeight: 400 }}>· {item.company}</span>
                </h3>
                <p
                  style={{
                    fontFamily: '-apple-system, "Segoe UI", sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: '#C4CCDE',
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
