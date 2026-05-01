import { test, expect } from '@playwright/test';

test('shows the web-to-app bridge section with curated app entry points', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /open anitrend where it fits best/i })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /open discover in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/discover');

  await expect(
    page.getByRole('link', { name: /open suggestions in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/suggestions');

  await expect(
    page.getByRole('link', { name: /open social in app/i })
  ).toHaveAttribute('href', 'app.anitrend://action/social');
});
