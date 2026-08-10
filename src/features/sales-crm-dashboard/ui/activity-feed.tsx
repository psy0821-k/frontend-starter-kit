import type { ActivityLogItem } from './types';
import { colors, typography, spacing, radius, shadow } from './tokens';

// 최근 활동 로그/알림 피드
const activities: ActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'contract',
    title: '계약 체결',
    description: '푸른숲조경(주)과 조경석 공급 계약 2,400만원 체결',
    timestamp: '10분 전',
  },
  {
    id: 'act-2',
    type: 'lead',
    title: '신규 리드 등록',
    description: '한빛가든센터에서 데크재 견적 문의 접수',
    timestamp: '32분 전',
  },
  {
    id: 'act-3',
    type: 'meeting',
    title: '미팅 일정',
    description: '내일 14:00 그린스케이프 담당자와 현장 답사 예정',
    timestamp: '1시간 전',
  },
  {
    id: 'act-4',
    type: 'alert',
    title: '재고 알림',
    description: '수입 화강석 자재 재고 15% 이하로 하락',
    timestamp: '2시간 전',
  },
  {
    id: 'act-5',
    type: 'contract',
    title: '계약 갱신',
    description: '도시숲엔지니어링 연간 유지보수 계약 갱신 완료',
    timestamp: '3시간 전',
  },
  {
    id: 'act-6',
    type: 'lead',
    title: '신규 리드 등록',
    description: '나래조경산업에서 대량 묘목 구매 상담 요청',
    timestamp: '5시간 전',
  },
];

const typeMeta: Record<ActivityLogItem['type'], { label: string; color: string }> = {
  lead: { label: '리드', color: colors.sage },
  contract: { label: '계약', color: colors.amber },
  meeting: { label: '미팅', color: '#5B7FA6' },
  alert: { label: '알림', color: colors.vermilion },
};

/** 최근 활동 로그/알림 피드 섹션 */
export function ActivityFeed() {
  return (
    <section
      aria-labelledby="activity-heading"
      style={{
        background: colors.ivorySoft,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: spacing.lg,
        boxShadow: shadow.card,
        flex: '1 1 360px',
      }}
    >
      <h2
        id="activity-heading"
        style={{
          fontFamily: typography.display,
          fontSize: 18,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md}px 0`,
        }}
      >
        최근 활동
      </h2>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
        }}
      >
        {activities.map((activity) => {
          const meta = typeMeta[activity.type];
          return (
            <li
              key={activity.id}
              style={{
                display: 'flex',
                gap: spacing.sm,
                paddingBottom: spacing.sm,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: meta.color,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: typography.body,
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.textPrimary,
                    }}
                  >
                    [{meta.label}] {activity.title}
                  </span>
                  <span
                    style={{ fontFamily: typography.data, fontSize: 11, color: colors.textMuted }}
                  >
                    {activity.timestamp}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: typography.body,
                    fontSize: 12,
                    color: colors.textSecondary,
                    margin: '4px 0 0 0',
                  }}
                >
                  {activity.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
