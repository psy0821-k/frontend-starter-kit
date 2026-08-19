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

test.describe('/templates — 카테고리 필터', () => {
  test('?category= 쿼리로 직접 접속하면 초기 렌더부터 해당 카테고리가 선택된 상태로 표시된다', async ({
    page,
  }) => {
    await page.goto('/templates?category=erp');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('button[type="button"]');
    expect(await cards.count()).toBeGreaterThan(0);

    const categoryFilter = page.getByRole('group', { name: '카테고리 필터' });
    await expect(categoryFilter.getByRole('button', { name: 'erp', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('새로고침 후에도 카테고리 필터가 유지된다', async ({ page }) => {
    await page.goto('/templates?category=erp');
    await page.waitForLoadState('networkidle');

    await page.reload();
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('group', { name: '카테고리 필터' });
    await expect(categoryFilter.getByRole('button', { name: 'erp', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('뒤로가기 시 이전 필터 상태로 돌아간다', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.getByRole('group', { name: '카테고리 필터' });
    await categoryFilter.getByRole('button', { name: 'erp', exact: true }).click();
    await page.waitForURL(/category=erp/);

    await page.goBack();
    await page.waitForURL('**/templates');

    await expect(categoryFilter.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
