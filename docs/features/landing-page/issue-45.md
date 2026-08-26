# Issue #45 — 랜딩페이지: 데모 비디오 섹션

## 시그니처

```ts
// src/features/landing/ui/landing-video-section.tsx
export function LandingVideoSection(): ReactElement;
```

- Props 없음 — 비디오 경로는 컴포넌트 내부 상수로 관리(`LANDING_TITLE`/`LANDING_DESCRIPTION` 패턴과 동일).
- `<video>` 요소: `preload="none"`, `muted`, `playsInline`, `loop` 없음(1회 재생 후 정지).
- 뷰포트 진입 시 `video.play()` 호출, `prefers-reduced-motion`이면 자동재생 생략(정지 상태 유지, `controls`로 수동 재생 가능).

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
reject될 수 있으나 `muted` 처리로 대부분 허용되고, 실패해도 조용히 무시(사용자가 `controls`로
직접 재생 가능).

## 테스트 시나리오

### useInView

- [정상] enabled가 true이고 ref 요소가 뷰포트에 교차하면 onEnter가 호출되어야 한다
- [경계] enabled가 false이면 IntersectionObserver를 생성하지 않아야 한다
- [경계] ref.current가 null이면 관찰을 시작하지 않아야 한다
- [정상] 언마운트 시 observer.disconnect가 호출되어야 한다

### LandingVideoSection

- [정상] 비디오 요소가 muted, playsInline 속성을 가져야 한다
- [정상] 비디오 요소가 preload="none" 속성을 가져야 한다
- [정상] 비디오 섹션이 뷰포트에 진입하면 play()가 호출되어야 한다
- [경계] prefers-reduced-motion이 reduce일 때 뷰포트에 진입해도 play()가 호출되지 않아야 한다
- [경계] prefers-reduced-motion이 reduce일 때 비디오에 controls 속성이 부여되어 수동 재생이
  가능해야 한다

## AC 커버리지

| AC                                                                                | 커버 시나리오                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 비디오 섹션이 뷰포트에 들어오면 데모 비디오가 재생된다                            | LandingVideoSection [정상] 뷰포트 진입 시 play() 호출                           |
| prefers-reduced-motion: reduce일 때 자동재생이 발생하지 않고 정지 상태로 노출된다 | LandingVideoSection [경계] reduce일 때 play() 미호출, [경계] controls 속성 부여 |
| 비디오 섹션이 뷰포트 밖에 있으면 리소스가 즉시 전체 로드되지 않는다               | LandingVideoSection [정상] preload="none" 속성                                  |

모든 AC가 시나리오로 커버됨.
