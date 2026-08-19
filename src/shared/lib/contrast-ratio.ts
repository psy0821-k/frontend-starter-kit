/**
 * RGB 색상 (0~255 범위의 R/G/B 채널)
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * sRGB 채널(0~255)을 WCAG 상대 휘도(relative luminance) 공식에 따라 선형화합니다.
 */
function toLinearChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * RGB 색상의 WCAG 상대 휘도를 계산합니다. (0~1)
 */
export function getRelativeLuminance(rgb: RgbColor): number {
  const r = toLinearChannel(rgb.r);
  const g = toLinearChannel(rgb.g);
  const b = toLinearChannel(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 두 RGB 색상 사이의 WCAG 대비비를 계산합니다.
 * 반환값은 1(대비 없음) ~ 21(최대 대비) 사이입니다.
 */
export function getContrastRatio(foreground: RgbColor, background: RgbColor): number {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 텍스트 대비가 WCAG AA 기준(본문 4.5:1, 큰 텍스트/UI 요소 3:1)을 충족하는지 판별합니다.
 */
export function meetsWcagAa(ratio: number, level: 'normal-text' | 'large-text-or-ui'): boolean {
  return level === 'normal-text' ? ratio >= 4.5 : ratio >= 3.0;
}
