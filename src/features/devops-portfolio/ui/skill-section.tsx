import type { SkillCategory } from './types';

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'Cloud & Infra',
    items: ['AWS (EC2, EKS, RDS, S3)', 'Terraform', 'Kubernetes', 'Helm'],
  },
  {
    category: 'CI/CD',
    items: ['GitHub Actions', 'ArgoCD', 'Jenkins', 'Docker'],
  },
  {
    category: 'Observability',
    items: ['Prometheus', 'Grafana', 'Datadog', 'OpenTelemetry'],
  },
  {
    category: 'Reliability',
    items: ['SLO/SLI 설계', '카나리 배포', 'Chaos Engineering', 'PagerDuty'],
  },
];

/**
 * Skill 섹션 — 카테고리별 그리드. 순서 정보가 없으므로 번호 라벨을 쓰지 않는다.
 */
export function SkillSection() {
  return (
    <section
      aria-labelledby="skill-heading"
      style={{
        padding: '80px 48px',
        backgroundColor: '#0F1626',
        color: '#E8ECF4',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <h2
          id="skill-heading"
          style={{
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 800,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            margin: '0 0 40px',
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
          {SKILL_CATEGORIES.map((group) => (
            <div
              key={group.category}
              style={{
                backgroundColor: '#141C2E',
                border: '1px solid #232C42',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontFamily: '"Segoe UI", Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#5EEAD4',
                  margin: '0 0 16px',
                }}
              >
                {group.category}
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {group.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: '-apple-system, "Segoe UI", sans-serif',
                      fontSize: '14px',
                      color: '#C4CCDE',
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
