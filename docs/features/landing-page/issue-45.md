# Issue #45 — 랜딩페이지: 데모 비디오 섹션

## 시그니처

```ts
// src/features/landing/ui/landing-video-section.tsx
export function LandingVideoSection(): ReactElement;
```

- Props 없음 — 비디오 경로는 컴포넌트 내부 상수로 관리(`LANDING_TITLE`/`LANDING_DESCRIPTION` 패턴과 동일).
- `<video>` 요소: `<source>`로 `webm`(우선) → `mp4`(폴백) 다중 소스, `preload="none"`, `muted`,
  `playsInline`, `loop`(reduced-motion 아닐 때만), `aria-label`(설명용, "웹 사이트 구현 영상").
  사용자가 재생/음소거/속도를 임의로 조작하지 못하도록 `controls`는 항상 미부여.
- 뷰포트 진입 시 `video.play()` 호출. 스크롤에 따라 gsap `ScrollTrigger`(scrub)로 비디오가
  `scale: 0.85 → 1`로 서서히 커지는 인터랙션.
- `prefers-reduced-motion`이면 자동재생·반복재생(`loop`)·스크롤 확대 인터랙션을 모두 생략하고
  첫 프레임만 정지 상태로 노출(컨트롤은 애초에 없으므로 별도 처리 불필요).

```ts
// src/features/landing/lib/use-in-view.ts
interface UseInViewOptions {
  ref: RefObject<Element | null>;
  onEnter: () => void;
  enabled: boolean;
}
export function useInView({ ref, onEnter, enabled }: UseInViewOptions): void;
```

- `src/features/starter-kit/lib/use-infinite-scroll.ts`와 동일한 "IntersectionObserver 감싼
  범용 훅 + 콜백" 패턴. `landing` 도메인 전용으로 새로 둔다(2회 규칙상 아직 shared 승격 대상 아님).

## 신규/영향 파일

- `src/features/landing/ui/landing-video-section.tsx` (신규)
- `src/features/landing/lib/use-in-view.ts` (신규)
- `src/features/landing/ui/landing-page.tsx` (수정 — 히어로와 설명 섹션 사이에 비디오 섹션 추가)

## 에러 케이스

없음 — 정적 자산 재생, 외부 데이터 조회 없음. `video.play()`가 브라우저 자동재생 정책으로
reject될 수 있으나 `muted` 처리로 대부분 허용되고, 실패해도 조용히 무시한다(사용자 조작 UI인
`controls`를 제공하지 않으므로 별도 폴백 UI는 두지 않는다 — 첫 프레임 정지 이미지가 자연스러운
폴백 역할을 한다).

## AC 해석 갱신 (사용자 지시 반영)

이슈 원문 AC2("prefers-reduced-motion이면 자동재생 대신 controls로 수동 재생 가능")는 이후
사용자 지시("음소거/컨트롤 제어 금지")와 충돌해 다음과 같이 재해석·확정했다: **controls는
항상 제공하지 않으며, reduced-motion이면 자동재생과 반복재생을 생략하고 첫 프레임만 정지 상태로
노출한다.** "정지 상태로 노출된다"는 원문 표현은 그대로 충족되고, "controls로 수동 재생"만
범위에서 제외된다.

## 테스트 시나리오

### useInView

- [정상] enabled가 true이고 ref 요소가 뷰포트에 교차하면 onEnter가 호출되어야 한다
- [경계] enabled가 false이면 IntersectionObserver를 생성하지 않아야 한다
- [경계] ref.current가 null이면 관찰을 시작하지 않아야 한다
- [정상] 언마운트 시 observer.disconnect가 호출되어야 한다

### LandingVideoSection

- [정상] 비디오 요소가 muted, playsInline 속성을 가져야 한다
- [정상] 비디오 요소가 preload="none" 속성을 가져야 한다
- [정상] 비디오 요소가 controls 속성을 가지지 않아야 한다
- [정상] webm과 mp4 소스를 모두 포함해야 한다(webm 우선, mp4 폴백)
- [정상] 의미를 설명하는 aria-label을 가져야 한다
- [정상] 비디오 섹션이 뷰포트에 진입하면 play()가 호출되어야 한다
- [정상] 반복 재생을 위해 loop 속성을 가져야 한다
- [경계] prefers-reduced-motion이 reduce일 때 뷰포트에 진입해도 play()가 호출되지 않아야 한다
- [경계] prefers-reduced-motion이 reduce일 때 loop 속성이 비활성화되어 정지 프레임만 노출해야 한다

## AC 커버리지

| AC                                                                                                          | 커버 시나리오                                                              |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 비디오 섹션이 뷰포트에 들어오면 데모 비디오가 재생된다                                                      | LandingVideoSection [정상] 뷰포트 진입 시 play() 호출                      |
| prefers-reduced-motion: reduce일 때 자동재생이 발생하지 않고 정지 상태로 노출된다(controls 없음으로 재해석) | LandingVideoSection [경계] reduce일 때 play() 미호출, [경계] loop 비활성화 |
| 비디오 섹션이 뷰포트 밖에 있으면 리소스가 즉시 전체 로드되지 않는다                                         | LandingVideoSection [정상] preload="none" 속성                             |

부가 요구사항(AC 외 사용자 지시):

- webm/mp4 폴백: [정상] webm과 mp4 소스를 모두 포함
- controls 완전 비활성화: [정상] controls 속성 미부여
- 반복재생(auto-loop): [정상] loop 속성
- aria-label: [정상] aria-label 존재
- 스크롤 확대 인터랙션: gsap ScrollTrigger(scrub)로 구현, 시각 효과라 유닛 테스트 대상에서 제외
  (jsdom에서 실제 스크롤 기반 scale 변화를 검증하기 어려움 — 히어로 웨이브의 opacity 트랜지션과
  동일하게 코드 레벨 존재 여부로 충분)

모든 AC 및 부가 요구사항이 시나리오로 커버됨.
