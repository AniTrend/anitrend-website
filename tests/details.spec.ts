import { test, expect } from '@playwright/test';

test('loads anime details with rich information', async ({ page }) => {
  // Navigate to Cowboy Bebop details page
  await page.goto('/anime/1');

  // Verify basic info
  await expect(
    page.getByRole('heading', { name: 'Cowboy Bebop' })
  ).toBeVisible();

  // Verify Information sidebar
  await expect(
    page.getByRole('heading', { name: 'Information' })
  ).toBeVisible();
  await expect(page.getByText(/Rating/)).toBeVisible();
  await expect(page.getByText('Duration')).toBeVisible();

  // Verify Sections
  await expect(page.getByRole('heading', { name: 'Synopsis' })).toBeVisible();

  // Verify Trailer
  // Note: Trailer might not be available for all anime, but Cowboy Bebop (ID 1) usually has one
  await expect(page.getByRole('heading', { name: 'Trailer' })).toBeVisible();
  await expect(page.locator('iframe').first()).toBeVisible();

  // Character data comes from Jikan and may be unavailable during rate limits.
  const charactersHeading = page.getByRole('heading', { name: 'Characters' });
  if (await charactersHeading.isVisible()) {
    await expect(page.getByRole('img', { name: 'Spike' })).toBeVisible();
  }
});

test('shows anime-specific fallback copy when app handoff does not open', async ({
  page,
}) => {
  await page.goto('/anime/1');

  await page
    .getByRole('complementary')
    .getByRole('link', { name: /open in app/i })
    .click();

  await expect(
    page.getByRole('heading', { name: /couldn't open this anime in anitrend/i })
  ).toBeVisible({ timeout: 3000 });
});
