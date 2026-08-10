// 리프넥서스 영업 대시보드에서 사용하는 공용 타입 정의

/** KPI 카드 한 장의 데이터 구조 */
export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  changeLabel: string;
  isPositive: boolean;
}

/** 사이드 네비게이션 메뉴 항목 (트리 구조) */
export interface NavMenuItem {
  id: string;
  label: string;
  isActive?: boolean;
  children?: NavMenuItem[];
}

/** 월별 계약 추이 데이터 포인트 */
export interface MonthlyContractPoint {
  month: string;
  amount: number;
}

/** 영업 퍼널 단계 데이터 */
export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  ratio: number;
}

/** 최근 활동 로그 항목 */
export interface ActivityLogItem {
  id: string;
  type: 'lead' | 'contract' | 'meeting' | 'alert';
  title: string;
  description: string;
  timestamp: string;
}

/** 진행중 업무(결재/승인 대기) 항목 */
export interface PendingTask {
  id: string;
  title: string;
  requester: string;
  category: string;
  dueDate: string;
  status: '대기' | '검토중' | '반려';
}
