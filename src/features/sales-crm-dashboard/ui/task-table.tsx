import type { CSSProperties } from 'react';
import type { PendingTask } from './types';
import { colors, typography, spacing, radius, shadow } from './tokens';

// 진행중 업무 — 결재/승인 대기 목록
const tasks: PendingTask[] = [
  {
    id: 'task-1',
    title: '푸른숲조경(주) 견적서 승인',
    requester: '김도현 대리',
    category: '견적서 승인',
    dueDate: '2026-08-11',
    status: '대기',
  },
  {
    id: 'task-2',
    title: '그린스케이프 계약서 검토',
    requester: '이서연 과장',
    category: '계약서 검토',
    dueDate: '2026-08-12',
    status: '검토중',
  },
  {
    id: 'task-3',
    title: '한빛가든센터 할인율 승인',
    requester: '박준혁 사원',
    category: '할인율 승인',
    dueDate: '2026-08-11',
    status: '대기',
  },
  {
    id: 'task-4',
    title: '도시숲엔지니어링 대량구매 특가 승인',
    requester: '최민지 대리',
    category: '특가 승인',
    dueDate: '2026-08-13',
    status: '반려',
  },
  {
    id: 'task-5',
    title: '나래조경산업 납품일정 조정 승인',
    requester: '정하윤 과장',
    category: '일정 조정',
    dueDate: '2026-08-14',
    status: '검토중',
  },
];

const statusStyle: Record<PendingTask['status'], { bg: string; color: string }> = {
  대기: { bg: colors.amberSoft, color: '#7A4E15' },
  검토중: { bg: '#DCE7DF', color: '#2F5C3F' },
  반려: { bg: colors.vermilionBg, color: colors.vermilion },
};

/** 진행중 업무(결재/승인 대기) 테이블 */
export function TaskTable() {
  return (
    <section
      aria-labelledby="task-heading"
      style={{
        background: colors.ivorySoft,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: spacing.lg,
        boxShadow: shadow.card,
      }}
    >
      <h2
        id="task-heading"
        style={{
          fontFamily: typography.display,
          fontSize: 18,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md}px 0`,
        }}
      >
        결재 대기 업무
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col" style={headerCellStyle}>
                업무명
              </th>
              <th scope="col" style={headerCellStyle}>
                요청자
              </th>
              <th scope="col" style={headerCellStyle}>
                구분
              </th>
              <th scope="col" style={headerCellStyle}>
                기한
              </th>
              <th scope="col" style={headerCellStyle}>
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const style = statusStyle[task.status];
              return (
                <tr key={task.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th scope="row" style={{ ...bodyCellStyle, textAlign: 'left', fontWeight: 600 }}>
                    {task.title}
                  </th>
                  <td style={bodyCellStyle}>{task.requester}</td>
                  <td style={bodyCellStyle}>{task.category}</td>
                  <td style={{ ...bodyCellStyle, fontFamily: typography.data }}>{task.dueDate}</td>
                  <td style={bodyCellStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: style.bg,
                        color: style.color,
                      }}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const headerCellStyle: CSSProperties = {
  textAlign: 'left',
  padding: `${spacing.sm}px ${spacing.sm}px`,
  fontFamily: typography.body,
  fontSize: 12,
  color: colors.textSecondary,
  borderBottom: `2px solid ${colors.border}`,
};

const bodyCellStyle: CSSProperties = {
  padding: `${spacing.sm}px ${spacing.sm}px`,
  fontFamily: typography.body,
  fontSize: 13,
  color: colors.textPrimary,
};
