import { HeroSection } from './hero-section';
import { AboutSection } from './about-section';
import { SkillSection } from './skill-section';
import { ProjectSection } from './project-section';
import { CareerSection } from './career-section';

/**
 * DevOps 엔지니어 포트폴리오 최상위 조합 컴포넌트.
 * Hero -> About -> Skill -> Project -> Career 순서로 섹션을 배치한다.
 */
export default function PortfolioPage() {
  return (
    <main
      style={{
        fontFamily: '-apple-system, "Segoe UI", sans-serif',
        backgroundColor: '#0B1220',
        minHeight: '100vh',
      }}
    >
      <HeroSection />
      <AboutSection />
      <SkillSection />
      <ProjectSection />
      <CareerSection />
    </main>
  );
}
