import { SidebarNav } from './sidebar-nav';
import { KpiSection } from './kpi-section';
import { ChartSection } from './chart-section';
import { ActivityFeed } from './activity-feed';
import { TaskTable } from './task-table';
import { colors, typography, spacing } from './tokens';

/**
 * 리프넥서스(LeafNexus) 영업관리 ERP 메인 대시보드.
 * 조경·원예 자재 B2B 유통사를 위한 CRM으로, 리드부터 계약까지의
 * 영업 성과를 한눈에 파악할 수 있도록 구성했다.
 */
export default function DashboardPage() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        minHeight: '100vh',
        fontFamily: typography.body,
        background: colors.ivory,
      }}
    >
      <SidebarNav />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            background: colors.forestPanel,
            padding: `${spacing.md}px ${spacing.xl}px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: typography.display,
              fontSize: 22,
              color: colors.textOnDark,
              margin: 0,
            }}
          >
            영업관리 대시보드
          </h1>
          <span
            style={{ fontFamily: typography.body, fontSize: 13, color: colors.textOnDarkMuted }}
          >
            2026년 8월 10일 · 영업1팀 정하윤 과장
          </span>
        </header>
        <main style={{ padding: spacing.xl, flex: 1 }}>
          <KpiSection />
          <ChartSection />
          <div
            style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', alignItems: 'flex-start' }}
          >
            <div style={{ flex: '2 1 480px' }}>
              <TaskTable />
            </div>
            <div style={{ flex: '1 1 320px' }}>
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
