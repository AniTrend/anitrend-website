import { test, expect } from '@playwright/test';

test('shows a fallback prompt when profile app handoff does not open the app', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await page.getByRole('link', { name: /open my lists in app/i }).click();

  await expect(
    page.getByRole('heading', { name: /couldn't open anitrend/i })
  ).toBeVisible({ timeout: 3000 });
});
