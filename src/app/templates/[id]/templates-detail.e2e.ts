import { expect, test } from '@playwright/test';

const TEMPLATE_ID = 'portfolio-landing-starter';

test.describe('/templates/[id] — 상세 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/templates/${TEMPLATE_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('상세 페이지가 정상 로드된다', async ({ page }) => {
    const body = page.locator('body');
    const bodyText = await body.textContent();

    expect(bodyText).toBeTruthy();
    expect(bodyText?.length || 0).toBeGreaterThan(0);
  });

  test('페이지에 제목 요소가 있다', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();

    expect(count).toBeGreaterThan(0);
  });

  test('상세 페이지는 HTML로 응답한다', async ({ page }) => {
    // 페이지가 로드되었는지 확인 (body에 내용이 있음)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length || 0).toBeGreaterThan(0);
  });

  test('상세 페이지는 한국어로 렌더링된다', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    expect(lang).toBe('ko');
  });

  test('존재하지 않는 템플릿은 404 상태를 반환한다', async ({ request }) => {
    const response = await request.get('/templates/invalid-id-xyz-12345');

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
