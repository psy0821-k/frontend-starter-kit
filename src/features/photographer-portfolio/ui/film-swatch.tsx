import type { FilmSwatch } from '../model/types';
import { COLORS, FONT_MONO } from './design-tokens';

interface FilmSwatchBoxProps {
  swatch: FilmSwatch;
  /** 세로/가로 비율. 기본값은 필름 콘택트시트 프레임과 같은 2:3 */
  aspectRatio?: string;
}

/**
 * 실제 사진 대신 쓰는 그라디언트 플레이스홀더 박스.
 * 필름 롤 프레임 번호 + 촬영 장소 캡션을 오버레이해 "스캔된 콘택트시트"처럼 보이게 한다.
 * figure/figcaption을 사용해 캡션이 스크린리더에도 사진 설명으로 전달되도록 한다.
 */
export function FilmSwatchBox({ swatch, aspectRatio = '2 / 3' }: FilmSwatchBoxProps) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        role="img"
        aria-label={`${swatch.caption} 촬영 사진 (플레이스홀더)`}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          background: swatch.gradient,
          borderRadius: '2px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(43, 38, 32, 0.25)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            fontFamily: FONT_MONO,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.05em',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {swatch.frameNumber}
        </span>
      </div>
      <figcaption
        style={{
          fontFamily: FONT_MONO,
          fontSize: '12px',
          color: COLORS.copperText,
          marginTop: '6px',
          letterSpacing: '0.02em',
        }}
      >
        {swatch.frameNumber} — {swatch.caption}
      </figcaption>
    </figure>
  );
}
