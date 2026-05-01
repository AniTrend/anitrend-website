import { test, expect } from '@playwright/test';

test('retires the recommend route and dashboard entry point', async ({ page }) => {
  const response = await page.goto('/recommend');

  expect(response?.status()).toBe(404);

  await page.goto('/dashboard');

  await expect(
    page.getByRole('link', { name: /ai recommendations/i })
  ).toHaveCount(0);
});
