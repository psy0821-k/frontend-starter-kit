/**
 * About Me 섹션 — 신조와 일하는 방식을 2컬럼으로 소개.
 */
export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      style={{
        padding: '80px 48px',
        backgroundColor: '#0B1220',
        color: '#E8ECF4',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <h2
          id="about-heading"
          style={{
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            margin: '0 0 40px',
          }}
        >
          About Me
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
          }}
        >
          <div style={{ flex: '1 1 320px', minWidth: '260px' }}>
            <p
              style={{
                fontFamily: '-apple-system, "Segoe UI", sans-serif',
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#C4CCDE',
                margin: '0 0 16px',
              }}
            >
              스타트업의 급격한 트래픽 증가와 대기업의 복잡한 레거시 인프라를 모두 경험했습니다.
              새로운 도구를 도입하기보다, 지금 있는 시스템을 &ldquo;왜 이렇게 동작하는지&rdquo;
              끝까지 이해하는 쪽을 선호합니다.
            </p>
            <p
              style={{
                fontFamily: '-apple-system, "Segoe UI", sans-serif',
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#C4CCDE',
                margin: 0,
              }}
            >
              장애 회고에서 가장 중요하게 보는 것은 &ldquo;누가&rdquo;가 아니라 &ldquo;왜 우리
              시스템은 이 신호를 미리 못 봤는가&rdquo; 입니다. 이 질문이 관측가능성 투자로 이어졌고,
              지금은 팀의 모니터링/알림 표준을 직접 설계하고 있습니다.
            </p>
          </div>

          <div
            style={{
              flex: '0 1 300px',
              minWidth: '240px',
              backgroundColor: '#141C2E',
              border: '1px solid #232C42',
              borderRadius: '12px',
              padding: '28px',
            }}
          >
            <dl style={{ margin: 0 }}>
              {[
                { term: '경력', desc: '8년차 · DevOps / SRE' },
                { term: '전문 영역', desc: 'AWS, Kubernetes, 관측가능성' },
                { term: '일하는 방식', desc: '원인 규명 후 재발 방지 설계' },
                { term: '관심사', desc: '점진적 배포, SLO 기반 알림' },
              ].map((row) => (
                <div
                  key={row.term}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: '1px solid #232C42',
                  }}
                >
                  <dt
                    style={{
                      fontFamily: '-apple-system, "Segoe UI", sans-serif',
                      fontSize: '13px',
                      color: '#8993AE',
                    }}
                  >
                    {row.term}
                  </dt>
                  <dd
                    style={{
                      fontFamily: '-apple-system, "Segoe UI", sans-serif',
                      fontSize: '13px',
                      color: '#E8ECF4',
                      textAlign: 'right',
                      margin: 0,
                    }}
                  >
                    {row.desc}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
