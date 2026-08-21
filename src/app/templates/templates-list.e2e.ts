import { expect, test } from '@playwright/test';
import { getContrastRatio, type RgbColor } from '@/shared/lib/contrast-ratio';

/**
 * CIE Lab(D50) 값을 sRGB(0~255) 채널로 변환한다.
 * 참고: CSS Color 4 명세의 lab-to-xyz / xyz-to-lab 알고리즘
 * (https://www.w3.org/TR/css-color-4/#color-conversion-code).
 */
function labToRgb(l: number, a: number, b: number): RgbColor {
  // Lab -> XYZ (D50 백색점 기준)
  const kappa = 24389 / 27;
  const epsilon = 216 / 24389;

  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const fx3 = fx ** 3;
  const fz3 = fz ** 3;

  const xr = fx3 > epsilon ? fx3 : (116 * fx - 16) / kappa;
  const yr = l > kappa * epsilon ? fy ** 3 : l / kappa;
  const zr = fz3 > epsilon ? fz3 : (116 * fz - 16) / kappa;

  // D50 기준 백색점
  const whiteX = 0.3457 / 0.3585;
  const whiteY = 1.0;
  const whiteZ = (1.0 - 0.3457 - 0.3585) / 0.3585;

  const x = xr * whiteX;
  const y = yr * whiteY;
  const z = zr * whiteZ;

  // XYZ(D50) -> linear sRGB(D65), Bradford 적응 포함 행렬
  const rLinear = 3.1338561 * x - 1.6168667 * y - 0.4906146 * z;
  const gLinear = -0.9787684 * x + 1.9161415 * y + 0.033454 * z;
  const bLinear = 0.0719453 * x - 0.2289914 * y + 1.4052427 * z;

  const toSrgb = (channel: number): number => {
    const clamped = Math.min(Math.max(channel, 0), 1);
    const value =
      clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(Math.min(Math.max(value, 0), 1) * 255);
  };

  return {
    r: toSrgb(rLinear),
    g: toSrgb(gLinear),
    b: toSrgb(bLinear),
  };
}

/**
 * getComputedStyle이 반환하는 색상 문자열을 RgbColor로 변환한다.
 * "rgb(r, g, b)"/"rgba(r, g, b, a)" 형식뿐 아니라, 이 프로젝트의 globals.css가
 * oklch()로 정의한 색상 토큰을 Chromium이 "lab(L a b)" 형식으로 직렬화해
 * 반환하는 경우도 처리한다. 알파 채널은 이미 getComputedStyle이 배경과 합성한
 * 최종 렌더링 값을 반환하므로 별도로 처리하지 않는다.
 */
function parseRgbString(value: string): RgbColor {
  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  const labMatch = value.match(/lab\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/);

  if (labMatch) {
    return labToRgb(Number(labMatch[1]), Number(labMatch[2]), Number(labMatch[3]));
  }

  throw new Error(`Unexpected color string: ${value}`);
}

test.describe('/templates — 목록 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
  });

  test('페이지에 스타터 킷 카드가 표시된다', async ({ page }) => {
    const cards = page.locator('button[type="button"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('카드는 button 요소로 렌더링된다', async ({ page }) => {
    const firstCard = page.locator('button[type="button"]').first();
    await expect(firstCard).toBeVisible();

    const tagName = await firstCard.evaluate((el) => el.tagName);
    expect(tagName).toBe('BUTTON');
  });

  test('카드에는 포커스 스타일 클래스가 있다', async ({ page }) => {
    const firstCard = page.locator('button[type="button"]').first();

    const classList = await firstCard.evaluate((el) => el.className);
    // focus-visible을 포함한 클래스가 있는지 확인
    expect(classList).toContain('focus-visible');
  });

  test('목록 페이지는 HTML로 렌더링된다', async ({ request }) => {
    const response = await request.get('/templates');
    const contentType = response.headers()['content-type'] || '';

    expect(response.status()).toBeLessThan(400);
    expect(contentType).toContain('text/html');
  });

  test('목록 페이지는 한국어로 렌더링된다', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('ko');
  });
});

test.describe('/templates — 카테고리 필터 칩 색상 대비 (WCAG AA)', () => {
  const WCAG_AA_MIN_CONTRAST_RATIO = 4.5;

  /**
   * 카테고리 필터 칩(선택/비선택)의 텍스트·배경 실제 렌더링 색상을 읽어
   * getContrastRatio에 넣을 수 있는 RgbColor 쌍으로 반환한다.
   */
  async function getChipContrastRatio(
    page: import('@playwright/test').Page,
    chipName: string
  ): Promise<number> {
    const chip = page
      .getByRole('group', { name: '카테고리 필터' })
      .getByRole('button', { name: chipName, exact: true });

    const { color, backgroundColor } = await chip.evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.color, backgroundColor: style.backgroundColor };
    });

    return getContrastRatio(parseRgbString(color), parseRgbString(backgroundColor));
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
  });

  test('카테고리 필터 칩(선택)은 라이트 테마에서 텍스트/배경 대비가 4.5:1 이상이다', async ({
    page,
  }) => {
    const ratio = await getChipContrastRatio(page, 'All');
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST_RATIO);
  });

  test('카테고리 필터 칩(비선택)은 라이트 테마에서 텍스트/배경 대비가 4.5:1 이상이다', async ({
    page,
  }) => {
    const chips = page.getByRole('group', { name: '카테고리 필터' }).getByRole('button');
    const unselectedChip = chips.filter({ hasNot: page.locator('[aria-pressed="true"]') }).first();
    const unselectedChipName = (await unselectedChip.textContent())?.trim() ?? '';

    const ratio = await getChipContrastRatio(page, unselectedChipName);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST_RATIO);
  });

  test('카테고리 필터 칩(선택)은 다크 테마에서 텍스트/배경 대비가 4.5:1 이상이다', async ({
    page,
  }) => {
    // next-themes는 attribute="class" + localStorage("theme")로 테마를 관리하며
    // defaultTheme="light"(고정값)이므로 prefers-color-scheme 미디어 에뮬레이션은
    // 적용되지 않는다. 페이지 스크립트가 실행되기 전 localStorage를 선점해
    // next-themes가 부팅 시 dark 클래스를 적용하도록 한다.
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);

    const ratio = await getChipContrastRatio(page, 'All');
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST_RATIO);
  });

  test('카테고리 필터 칩(비선택)은 다크 테마에서 텍스트/배경 대비가 4.5:1 이상이다', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);

    const chips = page.getByRole('group', { name: '카테고리 필터' }).getByRole('button');
    const unselectedChip = chips.filter({ hasNot: page.locator('[aria-pressed="true"]') }).first();
    const unselectedChipName = (await unselectedChip.textContent())?.trim() ?? '';

    const ratio = await getChipContrastRatio(page, unselectedChipName);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST_RATIO);
  });
});
