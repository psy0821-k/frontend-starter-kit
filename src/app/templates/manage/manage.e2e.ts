import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = 'test-admin@example.com';
const ADMIN_PASSWORD = 'TestPassword123!';

// header.tsx가 데스크톱/모바일에서 참고한 것과 동일한 모바일 뷰포트 프리셋(iPhone SE 폭 기준).
const MOBILE_VIEWPORT = { width: 375, height: 667 };

/**
 * 실제 로그인 폼(UI)을 통해 관리자 계정으로 로그인한다.
 * 세션/쿠키를 직접 주입하지 않고, /auth/login 페이지에 실제로 접속해 폼을 제출한다.
 */
async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('이메일').fill(ADMIN_EMAIL);
  await page.getByRole('textbox', { name: '비밀번호' }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();

  await page.waitForURL('/');
}

test.describe('/templates/manage — 모바일 뷰포트 레이아웃', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/templates/manage');
    await page.waitForLoadState('networkidle');
  });

  test('페이지 전체에는 가로 스크롤이 발생하지 않는다', async ({ page }) => {
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('테이블 컨테이너는 내부적으로 가로 스크롤이 가능하다', async ({ page }) => {
    const tableContainer = page.locator('[data-slot="table-container"]');
    await expect(tableContainer).toBeVisible();

    const overflowX = await tableContainer.evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflowX).toBe('auto');
  });

  test('테이블이 화면에 정상적으로 표시된다', async ({ page }) => {
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    const headers = table.getByRole('columnheader');
    await expect(headers).toHaveCount(5);
  });
});
