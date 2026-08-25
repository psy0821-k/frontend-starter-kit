import { expect, test } from '@playwright/test';

const FEATURE_ID = '40fab1f2-0333-4d63-b247-4fe2451a30ad';
const FEATURE = {
  title: '폼 검증',
  summary: '입력값 유효성을 선언적 스키마로 검증하고 필드별 에러를 표시하는 기능',
  descriptionSnippet: 'Zod 스키마로 검증 규칙을 선언하고',
  category: 'form',
  tag: '폼검증',
  techStack: 'React Hook Form',
  usageSnippet: 'useForm<SignUpFormValues>',
};

test.describe('/features/[id] — 상세 페이지', () => {
  test('존재하는 Feature id로 접속하면 title/summary/description/category/tags/tech_stack/usage가 화면에 표시된다', async ({
    page,
  }) => {
    await page.goto(`/features/${FEATURE_ID}`);
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();

    expect(bodyText).toContain(FEATURE.title);
    expect(bodyText).toContain(FEATURE.summary);
    expect(bodyText).toContain(FEATURE.descriptionSnippet);
    expect(bodyText).toContain(FEATURE.category);
    expect(bodyText).toContain(FEATURE.tag);
    expect(bodyText).toContain(FEATURE.techStack);
    expect(bodyText).toContain(FEATURE.usageSnippet);
  });

  test('feature_files가 있을 때 코드 뷰어에 파일 내용이 표시된다', async ({ page }) => {
    await page.goto(`/features/${FEATURE_ID}`);
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();

    expect(bodyText).toContain('sign-up-schema.ts');
  });

  test('존재하지 않는 Feature id로 접속하면 HTTP 404를 반환한다', async ({ request }) => {
    const response = await request.get('/features/invalid-id-xyz-12345');

    expect(response.status()).toBe(404);
  });

  test('존재하는 Feature id로 접속하면 북마크 버튼이 화면에 렌더링된다', async ({ page }) => {
    await page.goto(`/features/${FEATURE_ID}`);
    await page.waitForLoadState('networkidle');

    const bookmarkButton = page.getByRole('button', { name: /북마크/ });

    await expect(bookmarkButton).toBeVisible();
  });

  test('비로그인 상태에서 북마크 버튼을 클릭하면 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto(`/features/${FEATURE_ID}`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '북마크 추가' }).click();
    await page.waitForURL('**/auth/login');

    expect(page.url()).toContain('/auth/login');
  });
});
