import { expect, test } from '@playwright/test';

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
