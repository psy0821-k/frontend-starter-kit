import type { CSSProperties } from 'react';
import type { FunnelStage, MonthlyContractPoint } from './types';
import { colors, typography, spacing, radius, shadow } from './tokens';

// 영업 퍼널 단계 데이터 — 리드부터 계약까지
const funnelStages: FunnelStage[] = [
  { id: 'lead', label: '리드 확보', count: 320, ratio: 1 },
  { id: 'qualified', label: '요건 확인', count: 210, ratio: 0.656 },
  { id: 'proposal', label: '견적 제안', count: 120, ratio: 0.375 },
  { id: 'negotiation', label: '협상', count: 68, ratio: 0.213 },
  { id: 'contract', label: '계약 체결', count: 47, ratio: 0.147 },
];

// 월별 계약 추이 (최근 6개월, 단위: 백만원)
const monthlyContracts: MonthlyContractPoint[] = [
  { month: '3월', amount: 285 },
  { month: '4월', amount: 312 },
  { month: '5월', amount: 298 },
  { month: '6월', amount: 356 },
  { month: '7월', amount: 401 },
  { month: '8월', amount: 432 },
];

const FUNNEL_WIDTH = 360;
const FUNNEL_HEIGHT = 220;
const STAGE_HEIGHT = FUNNEL_HEIGHT / funnelStages.length;

/**
 * 영업 퍼널을 "나뭇가지가 갈라지며 좁아지는" 형태로 표현한 시그니처 SVG.
 * 성장(리드)에서 결실(계약)로 좁아지는 여정을 조경 도메인의 은유로 형상화했다.
 * 시각 정보만으로 전달하지 않도록 role="img" + aria-label로 텍스트 대안을 제공하고,
 * 하단에 병기 데이터 테이블을 함께 둔다.
 */
function GrowthFunnel() {
  const summaryLabel = funnelStages
    .map((stage) => `${stage.label} ${stage.count}건 (${Math.round(stage.ratio * 100)}%)`)
    .join(', ');

  const points = funnelStages.map((stage, index) => {
    const y = index * STAGE_HEIGHT;
    const halfWidth = (FUNNEL_WIDTH / 2) * stage.ratio;
    const center = FUNNEL_WIDTH / 2;
    return { left: center - halfWidth, right: center + halfWidth, y, stage };
  });

  let pathD = `M ${points[0].left} ${points[0].y} L ${points[0].right} ${points[0].y} `;
  for (let i = 1; i < points.length; i += 1) {
    pathD += `L ${points[i].right} ${points[i].y} `;
  }
  pathD += `L ${points[points.length - 1].left} ${points[points.length - 1].y} `;
  for (let i = points.length - 2; i >= 0; i -= 1) {
    pathD += `L ${points[i].left} ${points[i].y} `;
  }
  pathD += 'Z';

  return (
    <div>
      <svg
        width={FUNNEL_WIDTH}
        height={FUNNEL_HEIGHT + 20}
        viewBox={`0 0 ${FUNNEL_WIDTH} ${FUNNEL_HEIGHT + 20}`}
        role="img"
        aria-label={`영업 퍼널: ${summaryLabel}`}
      >
        <path d={pathD} fill={colors.amberSoft} stroke={colors.amber} strokeWidth={1.5} />
        {points.map((point) => (
          <g key={point.stage.id}>
            <line
              x1={0}
              x2={FUNNEL_WIDTH}
              y1={point.y}
              y2={point.y}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="2,3"
            />
            <text
              x={FUNNEL_WIDTH / 2}
              y={point.y + STAGE_HEIGHT / 2}
              textAnchor="middle"
              fontFamily={typography.body}
              fontSize={12}
              fill={colors.textPrimary}
              fontWeight={600}
            >
              {point.stage.label} · {point.stage.count}건
            </text>
          </g>
        ))}
      </svg>
      {/* SVG 시각 정보의 텍스트 대안: 병기 데이터 테이블 (시각적으로는 숨김 처리하지 않고 노출) */}
      <table
        style={{ width: '100%', marginTop: spacing.sm, borderCollapse: 'collapse', fontSize: 12 }}
      >
        <caption
          style={{
            textAlign: 'left',
            fontFamily: typography.body,
            color: colors.textMuted,
            marginBottom: 4,
          }}
        >
          영업 퍼널 단계별 상세 수치
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              style={{ textAlign: 'left', padding: '4px 8px', color: colors.textSecondary }}
            >
              단계
            </th>
            <th
              scope="col"
              style={{ textAlign: 'right', padding: '4px 8px', color: colors.textSecondary }}
            >
              건수
            </th>
            <th
              scope="col"
              style={{ textAlign: 'right', padding: '4px 8px', color: colors.textSecondary }}
            >
              비율
            </th>
          </tr>
        </thead>
        <tbody>
          {funnelStages.map((stage) => (
            <tr key={stage.id}>
              <th
                scope="row"
                style={{
                  textAlign: 'left',
                  padding: '4px 8px',
                  fontWeight: 400,
                  color: colors.textPrimary,
                }}
              >
                {stage.label}
              </th>
              <td
                style={{
                  textAlign: 'right',
                  padding: '4px 8px',
                  fontFamily: typography.data,
                  color: colors.textPrimary,
                }}
              >
                {stage.count}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '4px 8px',
                  fontFamily: typography.data,
                  color: colors.textPrimary,
                }}
              >
                {Math.round(stage.ratio * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LINE_WIDTH = 360;
const LINE_HEIGHT = 160;

/** 월별 계약 추이를 직접 그린 라인 차트 */
function MonthlyContractChart() {
  const maxAmount = Math.max(...monthlyContracts.map((point) => point.amount));
  const minAmount = Math.min(...monthlyContracts.map((point) => point.amount));
  const padding = 24;
  const chartW = LINE_WIDTH - padding * 2;
  const chartH = LINE_HEIGHT - padding * 2;

  const coords = monthlyContracts.map((point, index) => {
    const x = padding + (chartW / (monthlyContracts.length - 1)) * index;
    const ratio = (point.amount - minAmount) / (maxAmount - minAmount || 1);
    const y = padding + chartH - ratio * chartH;
    return { x, y, point };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const summaryLabel = monthlyContracts.map((p) => `${p.month} ${p.amount}백만원`).join(', ');

  return (
    <svg
      width={LINE_WIDTH}
      height={LINE_HEIGHT}
      viewBox={`0 0 ${LINE_WIDTH} ${LINE_HEIGHT}`}
      role="img"
      aria-label={`월별 계약 추이: ${summaryLabel}`}
    >
      <path
        d={linePath}
        fill="none"
        stroke={colors.amber}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map((c) => (
        <g key={c.point.month}>
          <circle
            cx={c.x}
            cy={c.y}
            r={4}
            fill={colors.forestDeep}
            stroke={colors.amber}
            strokeWidth={2}
          />
          <text
            x={c.x}
            y={LINE_HEIGHT - 4}
            textAnchor="middle"
            fontFamily={typography.body}
            fontSize={11}
            fill={colors.textSecondary}
          >
            {c.point.month}
          </text>
          <text
            x={c.x}
            y={c.y - 10}
            textAnchor="middle"
            fontFamily={typography.data}
            fontSize={11}
            fill={colors.textPrimary}
          >
            {c.point.amount}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 차트/통계 섹션 — 영업 퍼널(시그니처) + 월별 계약 추이 */
export function ChartSection() {
  const cardStyle: CSSProperties = {
    background: colors.ivorySoft,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadow.card,
    flex: '1 1 380px',
  };

  return (
    <section aria-labelledby="chart-heading" style={{ marginBottom: spacing.xl }}>
      <h2
        id="chart-heading"
        style={{
          fontFamily: typography.display,
          fontSize: 18,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md}px 0`,
        }}
      >
        영업 성과 분석
      </h2>
      <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: typography.body,
              fontSize: 14,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: '0 0 12px 0',
            }}
          >
            영업 퍼널 — 리드에서 계약까지
          </h3>
          <GrowthFunnel />
        </div>
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: typography.body,
              fontSize: 14,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: '0 0 12px 0',
            }}
          >
            월별 계약 추이 (백만원)
          </h3>
          <MonthlyContractChart />
        </div>
      </div>
    </section>
  );
}
