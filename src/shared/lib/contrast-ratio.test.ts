import { describe, expect, it } from 'vitest';
import { getContrastRatio, getRelativeLuminance, meetsWcagAa } from './contrast-ratio';

/**
 * 경계 시나리오에 사용하는 RGB 값에 대한 근거:
 *
 * - 이 테스트는 "계산 로직이 맞는가"를 검증하는 순수 함수 테스트다. 실제 프로젝트
 *   색상(oklch)이 4.5:1을 만족하는지의 최종 판단은 E2E(templates-list.e2e.ts)가
 *   실제 브라우저 렌더링 값(getComputedStyle)으로 수행한다 — issue-11.md에 이미
 *   그렇게 구분되어 있다.
 * - globals.css의 `--primary: oklch(0.205 0 0)` / `--primary-foreground: oklch(0.985 0 0)`는
 *   그레이스케일(chroma=0)이므로 오클ch lightness가 대략적인 밝기 순서를 그대로 반영한다.
 *   oklch(0.205 0 0)은 매우 어두운 회색(근사 RGB #1a1a1a 부근), oklch(0.985 0 0)은
 *   거의 흰색(근사 RGB #fafafa 부근)에 대응한다 — shadcn zinc 계열 기본 팔레트의 잘 알려진
 *   근사값을 사용한다.
 * - `--background: oklch(1 0 0)`(흰색, #ffffff) / `--foreground: oklch(0.145 0 0)`
 *   (매우 어두운 회색, 근사 #111111 부근)도 동일한 논리로 근사한다.
 * - 다크 테마는 `.dark` 토큰이 명암을 반전시킨다: `--primary: oklch(0.922 0 0)`(밝은 회색,
 *   근사 #e8e8e8) / `--primary-foreground: oklch(0.205 0 0)`(어두운 회색, 근사 #1a1a1a),
 *   `--background: oklch(0.145 0 0)`(근사 #111111) / `--foreground: oklch(0.985 0 0)`
 *   (근사 #fafafa).
 * - 위 근사값들은 모두 "명확히 4.5 이상"이 되도록 극단적이지 않은 유효 RGB 쌍으로
 *   선택했다 — 실제 렌더링 값과 오차가 있어도 계산 로직 검증 목적에는 문제가 없다.
 */

describe('getRelativeLuminance', () => {
  it('should return 1 when rgb is white (255, 255, 255)', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
  });

  it('should return 0 when rgb is black (0, 0, 0)', () => {
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('should return a value strictly between 0 and 1 when rgb is mid-gray (128, 128, 128)', () => {
    const luminance = getRelativeLuminance({ r: 128, g: 128, b: 128 });
    expect(luminance).toBeGreaterThan(0);
    expect(luminance).toBeLessThan(1);
  });
});

describe('getContrastRatio', () => {
  it('should return 21 when comparing black against white', () => {
    const ratio = getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 5);
  });

  it('should return 1 when foreground and background colors are identical', () => {
    const ratio = getContrastRatio({ r: 100, g: 150, b: 200 }, { r: 100, g: 150, b: 200 });
    expect(ratio).toBeCloseTo(1, 5);
  });

  it('should be symmetric (same ratio) when foreground/background arguments are swapped', () => {
    const colorA = { r: 30, g: 30, b: 30 };
    const colorB = { r: 220, g: 220, b: 220 };
    expect(getContrastRatio(colorA, colorB)).toBeCloseTo(getContrastRatio(colorB, colorA), 10);
  });

  it('should return a value >= 4.5 when given the light-theme selected chip colors (primary foreground on primary, oklch(0.205 0 0) / oklch(0.985 0 0) 근사 RGB)', () => {
    // --primary-foreground: oklch(0.985 0 0) 근사 #fafafa (텍스트)
    // --primary: oklch(0.205 0 0) 근사 #1a1a1a (배경)
    const ratio = getContrastRatio({ r: 250, g: 250, b: 250 }, { r: 26, g: 26, b: 26 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should return a value >= 4.5 when given the light-theme unselected chip colors (foreground on background)', () => {
    // --foreground: oklch(0.145 0 0) 근사 #111111 (텍스트)
    // --background: oklch(1 0 0) 근사 #ffffff (배경)
    const ratio = getContrastRatio({ r: 17, g: 17, b: 17 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should return a value >= 4.5 when given the dark-theme selected chip colors (primary-foreground on primary, dark 토큰)', () => {
    // .dark --primary-foreground: oklch(0.205 0 0) 근사 #1a1a1a (텍스트)
    // .dark --primary: oklch(0.922 0 0) 근사 #e8e8e8 (배경)
    const ratio = getContrastRatio({ r: 26, g: 26, b: 26 }, { r: 232, g: 232, b: 232 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should return a value >= 4.5 when given the dark-theme unselected chip colors (foreground on background, dark 토큰)', () => {
    // .dark --foreground: oklch(0.985 0 0) 근사 #fafafa (텍스트)
    // .dark --background: oklch(0.145 0 0) 근사 #111111 (배경)
    const ratio = getContrastRatio({ r: 250, g: 250, b: 250 }, { r: 17, g: 17, b: 17 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('meetsWcagAa', () => {
  it("should return true when ratio is 4.5 and level is 'normal-text' (경계값 포함)", () => {
    expect(meetsWcagAa(4.5, 'normal-text')).toBe(true);
  });

  it("should return false when ratio is 4.49 and level is 'normal-text'", () => {
    expect(meetsWcagAa(4.49, 'normal-text')).toBe(false);
  });

  it("should return true when ratio is 3.0 and level is 'large-text-or-ui'", () => {
    expect(meetsWcagAa(3.0, 'large-text-or-ui')).toBe(true);
  });

  it("should return false when ratio is 2.99 and level is 'large-text-or-ui'", () => {
    expect(meetsWcagAa(2.99, 'large-text-or-ui')).toBe(false);
  });
});
