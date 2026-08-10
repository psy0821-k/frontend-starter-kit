import type { CSSProperties } from 'react';
import type { NavMenuItem } from './types';
import { colors, typography, spacing } from './tokens';

// 리프넥서스 CRM 기능 메뉴 트리
const menuItems: NavMenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    isActive: true,
  },
  {
    id: 'leads',
    label: '리드 관리',
    children: [
      { id: 'leads-new', label: '신규 리드' },
      { id: 'leads-assigned', label: '배정된 리드' },
    ],
  },
  {
    id: 'deals',
    label: '영업 파이프라인',
    children: [
      { id: 'deals-board', label: '단계별 보드' },
      { id: 'deals-quotes', label: '견적서 관리' },
    ],
  },
  {
    id: 'customers',
    label: '거래처 관리',
    children: [
      { id: 'customers-b2b', label: 'B2B 거래처' },
      { id: 'customers-contacts', label: '담당자 연락처' },
    ],
  },
  {
    id: 'contracts',
    label: '계약/승인함',
  },
  {
    id: 'reports',
    label: '통계 리포트',
  },
];

interface NavGroupProps {
  item: NavMenuItem;
}

// 하위 메뉴가 있으면 트리로, 없으면 단일 항목으로 렌더링
function NavGroup({ item }: NavGroupProps) {
  const baseItemStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: 6,
    border: 'none',
    fontFamily: typography.body,
    fontSize: 14,
    cursor: 'pointer',
    background: item.isActive ? colors.amber : 'transparent',
    color: item.isActive ? colors.forestDeep : colors.textOnDark,
    fontWeight: item.isActive ? 700 : 400,
  };

  return (
    <li>
      <button type="button" style={baseItemStyle} aria-current={item.isActive ? 'page' : undefined}>
        {item.label}
      </button>
      {item.children && item.children.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: `${spacing.xs}px 0 ${spacing.xs}px ${spacing.md}px`,
          }}
        >
          {item.children.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: `${spacing.xs + 2}px ${spacing.md}px`,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: colors.textOnDarkMuted,
                  fontFamily: typography.body,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {child.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** 사이드 네비게이션 — 기능 메뉴 트리 (semantic nav + ul/li 구조) */
export function SidebarNav() {
  return (
    <nav
      aria-label="주요 메뉴"
      style={{ background: colors.forestDeep, height: '100%', padding: spacing.lg }}
    >
      <div style={{ marginBottom: spacing.xl }}>
        <span
          style={{
            fontFamily: typography.display,
            fontSize: 20,
            fontWeight: 700,
            color: colors.textOnDark,
            letterSpacing: 0.5,
          }}
        >
          LeafNexus
        </span>
        <div
          style={{
            fontFamily: typography.body,
            fontSize: 11,
            color: colors.textOnDarkMuted,
            marginTop: 2,
          }}
        >
          조경자재 B2B 영업관리
        </div>
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
        }}
      >
        {menuItems.map((item) => (
          <NavGroup key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
