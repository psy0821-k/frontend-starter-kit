import type { ContactChannel, PortfolioProject, TerminalIdentity } from '../model/types';
import { TerminalHero } from './terminal-hero';
import { ProjectDirectory } from './project-directory';
import { ContactFooter } from './contact-footer';

const IDENTITY: TerminalIdentity = {
  name: '김개발',
  role: '프론트엔드 엔지니어',
  location: 'Seoul, KR',
  avatarUrl: '/mock/portfolio-landing/avatar.png',
  commandLines: ['whoami', '경험 5년, React와 접근성에 집중하는 프론트엔드 엔지니어입니다.'],
};

const PROJECTS: PortfolioProject[] = [
  {
    id: 'checkout-redesign',
    path: '~/projects/checkout-redesign',
    title: '결제 퍼널 리디자인',
    summary: '이탈률 18% 감소를 이끌어낸 3단계 결제 플로우 재설계',
    stack: ['Next.js', 'TypeScript', 'Zustand'],
    year: '2026',
    href: '#',
  },
  {
    id: 'design-system',
    path: '~/projects/design-system',
    title: '사내 디자인 시스템',
    summary: '접근성 기준을 내장한 컴포넌트 라이브러리 구축 및 문서화',
    stack: ['React', 'Storybook', 'Radix UI'],
    year: '2025',
    href: '#',
  },
  {
    id: 'realtime-dashboard',
    path: '~/projects/realtime-dashboard',
    title: '실시간 운영 대시보드',
    summary: 'WebSocket 기반 지표 시각화와 알림 트리거 구현',
    stack: ['Next.js', 'Recharts', 'WebSocket'],
    year: '2025',
    href: '#',
  },
];

const CONTACT_CHANNELS: ContactChannel[] = [
  { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
  { label: 'github', value: 'github.com/example', href: 'https://github.com/example' },
  { label: 'linkedin', value: 'linkedin.com/in/example', href: 'https://linkedin.com/in/example' },
];

export function PortfolioLandingPage() {
  return (
    <main>
      <TerminalHero identity={IDENTITY} />
      <ProjectDirectory projects={PROJECTS} />
      <ContactFooter channels={CONTACT_CHANNELS} />
    </main>
  );
}
