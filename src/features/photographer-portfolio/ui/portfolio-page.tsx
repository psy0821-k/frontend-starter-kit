import { HeroSection } from './hero-section';
import { AboutSection } from './about-section';
import { SkillSection } from './skill-section';
import { ProjectSection } from './project-section';
import { CareerSection } from './career-section';
import { COLORS, FONT_BODY } from './design-tokens';

/**
 * 다큐멘터리 사진작가 서한나의 포트폴리오 페이지.
 * Hero → About → Skill → Project → Career 순서로 콘택트시트 컨셉의
 * 필름 프레임 번호·타자기 캡션을 일관되게 사용한다.
 * Sandpack 미리보기의 entry로 사용되므로 default export여야 한다.
 */
export default function PortfolioPage() {
  return (
    <main style={{ fontFamily: FONT_BODY, backgroundColor: COLORS.paper, minHeight: '100vh' }}>
      <HeroSection />
      <AboutSection />
      <SkillSection />
      <ProjectSection />
      <CareerSection />
    </main>
  );
}
