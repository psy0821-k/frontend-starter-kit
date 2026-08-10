import type { PipelineStage } from './types';

// 배포 파이프라인 헬스 다이어그램 데이터 (시그니처 요소)
const PIPELINE_STAGES: PipelineStage[] = [
  { label: 'Build', detail: '커밋마다 자동 빌드' },
  { label: 'Test', detail: '회귀·부하 테스트' },
  { label: 'Deploy', detail: '카나리 점진 배포' },
  { label: 'Monitor', detail: 'SLO 실시간 관측' },
];

/**
 * 히어로 섹션 — 좌측 소개 텍스트, 우측 파이프라인 헬스 다이어그램(시그니처 요소).
 */
export function HeroSection() {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '48px',
        padding: '96px 48px 72px',
        backgroundColor: '#0B1220',
        color: '#E8ECF4',
      }}
    >
      <div style={{ flex: '1 1 420px', minWidth: '280px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: '#141C2E',
            border: '1px solid #5B6785',
            marginBottom: '24px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#5EEAD4',
              boxShadow: '0 0 8px #5EEAD4',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'Consolas, "SF Mono", Menlo, monospace',
              fontSize: '13px',
              color: '#5EEAD4',
              letterSpacing: '0.02em',
            }}
          >
            SLO 99.97% · 지난 90일
          </span>
        </div>

        <h1
          style={{
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}
        >
          한서영
          <br />
          <span style={{ color: '#5EEAD4' }}>DevOps Engineer</span>
        </h1>

        <p
          style={{
            fontFamily: '-apple-system, "Segoe UI", sans-serif',
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#C4CCDE',
            maxWidth: '480px',
            margin: 0,
          }}
        >
          장애가 나지 않는 시스템이 아니라, 장애가 나도 아무도 모르게 넘어가는 시스템을 만듭니다.
          8년째 AWS와 Kubernetes 위에서 관측가능성과 점진적 배포를 설계하고 있습니다.
        </p>
      </div>

      <div
        style={{
          flex: '1 1 360px',
          minWidth: '280px',
          backgroundColor: '#141C2E',
          border: '1px solid #232C42',
          borderRadius: '16px',
          padding: '32px 24px',
        }}
      >
        <h2
          id="pipeline-heading"
          style={{
            fontFamily: 'Consolas, "SF Mono", Menlo, monospace',
            fontWeight: 400,
            fontSize: '12px',
            color: '#8993AE',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}
        >
          Deployment Pipeline Health
        </h2>

        <ol
          aria-labelledby="pipeline-heading"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {PIPELINE_STAGES.map((stage, index) => (
            <li
              key={stage.label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'center',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#5EEAD4',
                    boxShadow: '0 0 0 4px rgba(94, 234, 212, 0.15)',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Segoe UI", Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#E8ECF4',
                  }}
                >
                  {stage.label}
                </span>
                <span
                  style={{
                    fontFamily: '-apple-system, "Segoe UI", sans-serif',
                    fontSize: '11px',
                    color: '#8993AE',
                    maxWidth: '76px',
                  }}
                >
                  {stage.detail}
                </span>
              </div>
              {index < PIPELINE_STAGES.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: '#232C42',
                    marginBottom: '38px',
                    marginLeft: '4px',
                    marginRight: '4px',
                  }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
