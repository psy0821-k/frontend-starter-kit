import { HeroWaveBackground } from './hero-wave-background';
import { LandingDescriptionSection } from './landing-description-section';
import { LandingVideoSection } from './landing-video-section';

export const LANDING_TITLE = 'Frontend Starter Platform';
export const LANDING_DESCRIPTION =
  '프론트엔드 프로젝트를 빠르게 시작할 수 있는 스타터 킷입니다. 컴포넌트 별로 나누어져 있어 분리를 하는 비용을 절약할 수 있습니다. 단순 복사 붙여넣기를 통해 나만의 프로젝트를 완성하세요 ';

export function LandingPage() {
  return (
    <>
      <section
        data-testid="landing-hero-section"
        className="relative flex min-h-[70vh] flex-col justify-center gap-4 overflow-hidden border-0 bg-white px-4 py-20 sm:px-6 lg:px-8"
      >
        <HeroWaveBackground />

        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-5xl font-bold tracking-tight text-[#000B97] sm:text-7xl lg:text-8xl">
          {LANDING_TITLE}
        </h1>
      </section>

      <LandingDescriptionSection description={LANDING_DESCRIPTION} />
      <LandingVideoSection />
    </>
  );
}
