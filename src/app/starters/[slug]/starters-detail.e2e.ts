import { expect, test } from '@playwright/test';

test.describe('/starters/[slug] — 상세 페이지', () => {
  test('portfolio 스타터는 터미널 히어로를 포함한 포트폴리오 랜딩 화면을 보여준다', async ({
    page,
  }) => {
    await page.goto('/starters/portfolio');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('whoami');
  });

  test('erp 스타터는 영업관리 대시보드 화면을 보여준다', async ({ page }) => {
    await page.goto('/starters/erp');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { name: '영업관리 대시보드' });
    await expect(heading).toBeVisible();
  });

  test('카탈로그에 없는 slug는 404 상태를 반환한다', async ({ request }) => {
    const response = await request.get('/starters/unknown-slug');

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
