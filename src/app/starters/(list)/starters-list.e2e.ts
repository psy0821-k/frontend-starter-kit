import { expect, test } from '@playwright/test';

test.describe('/starters — 목록 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/starters');
    await page.waitForLoadState('networkidle');
  });

  test('포트폴리오 스타터 카드와 ERP 스타터 카드가 각각 보인다', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();

    expect(bodyText).toContain('포트폴리오 스타터');
    expect(bodyText).toContain('ERP 스타터');
  });

  test('포트폴리오 카드의 바로가기 링크는 /starters/portfolio를 가리킨다', async ({ page }) => {
    const link = page.getByRole('link', { name: /포트폴리오 스타터/ });

    await expect(link).toHaveAttribute('href', '/starters/portfolio');
  });

  test('ERP 카드의 바로가기 링크는 /starters/erp를 가리킨다', async ({ page }) => {
    const link = page.getByRole('link', { name: /ERP 스타터/ });

    await expect(link).toHaveAttribute('href', '/starters/erp');
  });
});
