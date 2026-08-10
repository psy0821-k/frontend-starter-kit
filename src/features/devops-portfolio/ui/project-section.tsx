import type { ProjectItem } from './types';

const PROJECTS: ProjectItem[] = [
  {
    name: '멀티 리전 무중단 배포 전환',
    period: '2023.03 - 2023.09',
    summary:
      '단일 리전 EKS 클러스터를 서울/도쿄 2개 리전으로 이중화하고, 카나리 배포와 자동 롤백 파이프라인을 구축했습니다.',
    metrics: ['배포 실패율 12% → 1.8%', '평균 복구 시간(MTTR) 42분 → 6분'],
    stack: ['Kubernetes', 'ArgoCD', 'AWS Route53'],
  },
  {
    name: 'SLO 기반 알림 체계 재설계',
    period: '2022.06 - 2022.11',
    summary:
      '임계값 알림 위주였던 모니터링을 SLO/에러버짓 기반 알림으로 전환해, 실제 사용자 영향이 있는 이슈만 온콜로 전달되도록 개선했습니다.',
    metrics: ['불필요 알림 68% 감소', '온콜 대응 만족도 상승'],
    stack: ['Prometheus', 'Grafana', 'PagerDuty'],
  },
  {
    name: '인프라 비용 최적화 프로젝트',
    period: '2021.09 - 2022.02',
    summary:
      '유휴 리소스 자동 스케일링과 스팟 인스턴스 전환, 저장소 계층화를 통해 클라우드 비용 구조를 재설계했습니다.',
    metrics: ['월 클라우드 비용 34% 절감', 'CPU 활용률 28% → 61%'],
    stack: ['AWS', 'Terraform', 'Karpenter'],
  },
  {
    name: 'CI 파이프라인 표준화',
    period: '2020.11 - 2021.05',
    summary:
      '팀마다 제각각이던 빌드·배포 스크립트를 재사용 가능한 GitHub Actions 워크플로로 표준화하고 사내 템플릿으로 배포했습니다.',
    metrics: ['평균 빌드 시간 22분 → 7분', '신규 서비스 온보딩 3일 → 반나절'],
    stack: ['GitHub Actions', 'Docker', 'Terraform'],
  },
];

/**
 * Project 섹션 — 인프라 개선 사례를 지표와 함께 카드로 제시.
 */
export function ProjectSection() {
  return (
    <section
      aria-labelledby="project-heading"
      style={{
        padding: '80px 48px',
        backgroundColor: '#0B1220',
        color: '#E8ECF4',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <h2
          id="project-heading"
          style={{
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            margin: '0 0 40px',
          }}
        >
          Project
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              style={{
                backgroundColor: '#141C2E',
                border: '1px solid #232C42',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: '"Segoe UI", Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: '17px',
                    margin: '0 0 4px',
                  }}
                >
                  {project.name}
                </h3>
                <p
                  style={{
                    fontFamily: 'Consolas, "SF Mono", Menlo, monospace',
                    fontSize: '12px',
                    color: '#8993AE',
                    margin: 0,
                  }}
                >
                  {project.period}
                </p>
              </div>

              <p
                style={{
                  fontFamily: '-apple-system, "Segoe UI", sans-serif',
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: '#C4CCDE',
                  margin: 0,
                  flexGrow: 1,
                }}
              >
                {project.summary}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {project.metrics.map((metric) => (
                  <li
                    key={metric}
                    style={{
                      fontFamily: 'Consolas, "SF Mono", Menlo, monospace',
                      fontSize: '13px',
                      color: '#5EEAD4',
                    }}
                  >
                    ▲ {metric}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '4px',
                }}
              >
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontFamily: '-apple-system, "Segoe UI", sans-serif',
                      fontSize: '11px',
                      color: '#F5A623',
                      border: '1px solid #3A2E1A',
                      backgroundColor: 'rgba(245, 166, 35, 0.08)',
                      borderRadius: '999px',
                      padding: '3px 10px',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
