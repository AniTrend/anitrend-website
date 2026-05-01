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

test('shows curated app-entry points for the verified native surfaces', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await expect(
    page.getByRole('link', { name: /open profile in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/profile');

  await expect(
    page.getByRole('link', { name: /open discover in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/discover');

  await expect(
    page.getByRole('link', { name: /open suggestions in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/suggestions');

  await expect(
    page.getByRole('link', { name: /open social in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/social');

  await expect(
    page.getByRole('link', { name: /open settings in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/settings');
});
