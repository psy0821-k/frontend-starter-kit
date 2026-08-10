import type { KpiMetric } from './types';
import { colors, typography, spacing, radius, shadow } from './tokens';

// 이번 달 핵심 영업 지표 (5개)
const metrics: KpiMetric[] = [
  {
    id: 'revenue',
    label: '이번달 매출',
    value: '4억 3,200',
    unit: '만원',
    changeLabel: '전월 대비 +12.4%',
    isPositive: true,
  },
  {
    id: 'new-customers',
    label: '신규 거래처',
    value: '18',
    unit: '곳',
    changeLabel: '전월 대비 +3곳',
    isPositive: true,
  },
  {
    id: 'pipeline',
    label: '영업 파이프라인',
    value: '12억 1,500',
    unit: '만원',
    changeLabel: '진행중 딜 47건',
    isPositive: true,
  },
  {
    id: 'conversion',
    label: '전환율',
    value: '24.6',
    unit: '%',
    changeLabel: '전월 대비 -1.2%p',
    isPositive: false,
  },
  {
    id: 'avg-deal',
    label: '평균 계약 규모',
    value: '2,850',
    unit: '만원',
    changeLabel: '전월 대비 +6.1%',
    isPositive: true,
  },
];

/** KPI 카드 행 — 이번 달 핵심 영업 지표 */
export function KpiSection() {
  return (
    <section aria-labelledby="kpi-heading" style={{ marginBottom: spacing.xl }}>
      <h2
        id="kpi-heading"
        style={{
          fontFamily: typography.display,
          fontSize: 18,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md}px 0`,
        }}
      >
        이번 달 핵심 지표
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: spacing.md,
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.id}
            style={{
              background: colors.ivorySoft,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: spacing.lg,
              boxShadow: shadow.card,
              borderTop: `3px solid ${metric.isPositive ? colors.amber : colors.vermilion}`,
            }}
          >
            <div
              style={{
                fontFamily: typography.body,
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: spacing.xs,
              }}
            >
              {metric.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: typography.data,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                {metric.value}
              </span>
              {metric.unit && (
                <span
                  style={{ fontFamily: typography.data, fontSize: 14, color: colors.textSecondary }}
                >
                  {metric.unit}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: typography.body,
                fontSize: 12,
                marginTop: spacing.sm,
                color: metric.isPositive ? '#3F7A52' : colors.vermilion,
                fontWeight: 600,
              }}
            >
              {metric.changeLabel}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
