import { expect, test, type Page } from '@playwright/test';

/**
 * plan/test-accounts.md의 테스트 계정 — 이메일 인증 없이 즉시 로그인 가능하며
 * 로그인 페이지 자체에도 안내되어 있는 계정이다(관리자 권한 없음).
 */
const TEST_ACCOUNT = {
  email: 'test01@example.com',
  password: 'TestPassword123!',
};

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

/**
 * 로그인 폼을 제출해 실제 세션 쿠키를 발급받는다.
 * Vitest 유닛 테스트처럼 getCurrentUser를 모킹할 수 없으므로(별도 서버 프로세스),
 * 기존 features-detail.e2e.ts가 다루는 "비로그인 → /auth/login 리다이렉트" 흐름의
 * 반대편인 "실제 로그인 폼 제출"로 로그인 상태를 만든다.
 */
async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('#email').fill(TEST_ACCOUNT.email);
  await page.locator('#password').fill(TEST_ACCOUNT.password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('/');
  await page.waitForLoadState('networkidle');
}

/**
 * 문서 전체 너비가 뷰포트 너비를 넘지 않는지(가로 스크롤 미발생) 확인한다.
 */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('헤더 — Avatar/드롭다운 반응형 (AC6)', () => {
  test.describe('모바일 뷰포트(375px)', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test('로그인된 헤더에 Avatar가 레이아웃 깨짐 없이 표시된다', async ({ page }) => {
      await loginAsTestUser(page);

      const trigger = page.getByRole('button', { name: /님 메뉴 열기/ });
      await expect(trigger).toBeVisible();

      await expectNoHorizontalScroll(page);

      const headerBox = await page.locator('header').boundingBox();
      const triggerBox = await trigger.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(triggerBox).not.toBeNull();
      if (headerBox && triggerBox) {
        // 트리거가 헤더 영역 안에 완전히 들어와 있어야 한다(겹침/이탈 없음)
        expect(triggerBox.x).toBeGreaterThanOrEqual(headerBox.x);
        expect(triggerBox.x + triggerBox.width).toBeLessThanOrEqual(headerBox.x + headerBox.width);
        expect(triggerBox.y).toBeGreaterThanOrEqual(headerBox.y);
        expect(triggerBox.y + triggerBox.height).toBeLessThanOrEqual(
          headerBox.y + headerBox.height
        );
      }
    });

    test('Avatar 클릭 시 드롭다운이 뷰포트 밖으로 벗어나지 않는다', async ({ page }) => {
      await loginAsTestUser(page);

      await page.getByRole('button', { name: /님 메뉴 열기/ }).click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      const menuBox = await menu.boundingBox();
      const viewportSize = page.viewportSize();
      expect(menuBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      if (menuBox && viewportSize) {
        expect(menuBox.x).toBeGreaterThanOrEqual(0);
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
        expect(menuBox.y).toBeGreaterThanOrEqual(0);
        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height);
      }

      await expect(page.getByRole('menuitem', { name: '로그아웃' })).toBeVisible();
    });
  });

  test.describe('태블릿 뷰포트(768px)', () => {
    test.use({ viewport: VIEWPORTS.tablet });

    test('로그인된 헤더에 Avatar가 레이아웃 깨짐 없이 표시된다', async ({ page }) => {
      await loginAsTestUser(page);

      const trigger = page.getByRole('button', { name: /님 메뉴 열기/ });
      await expect(trigger).toBeVisible();
      await expectNoHorizontalScroll(page);
    });

    test('Avatar 클릭 시 드롭다운이 뷰포트 밖으로 벗어나지 않는다', async ({ page }) => {
      await loginAsTestUser(page);

      await page.getByRole('button', { name: /님 메뉴 열기/ }).click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      const menuBox = await menu.boundingBox();
      const viewportSize = page.viewportSize();
      expect(menuBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      if (menuBox && viewportSize) {
        expect(menuBox.x).toBeGreaterThanOrEqual(0);
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
      }
    });
  });

  test.describe('데스크톱 뷰포트(1280px)', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('로그인된 헤더에 Avatar가 레이아웃 깨짐 없이 표시된다', async ({ page }) => {
      await loginAsTestUser(page);

      const trigger = page.getByRole('button', { name: /님 메뉴 열기/ });
      await expect(trigger).toBeVisible();
      await expectNoHorizontalScroll(page);
    });

    test('Avatar 클릭 시 드롭다운이 뷰포트 밖으로 벗어나지 않는다', async ({ page }) => {
      await loginAsTestUser(page);

      await page.getByRole('button', { name: /님 메뉴 열기/ }).click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      const menuBox = await menu.boundingBox();
      const viewportSize = page.viewportSize();
      expect(menuBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      if (menuBox && viewportSize) {
        expect(menuBox.x).toBeGreaterThanOrEqual(0);
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width);
      }

      await expect(page.getByRole('menuitem', { name: '로그아웃' })).toBeVisible();
    });
  });
});
