import { test, expect } from '@playwright/test';

test('applies search and filters then persists via URL reload', async ({
  page,
}) => {
  await page.goto('/discover');

  await page.getByRole('button', { name: 'Advanced Filters' }).click();

  const sfwSwitch = page.getByLabel('Safe for Work only');
  await sfwSwitch.click();

  const searchInput = page.getByPlaceholder('Search for an anime...');
  await searchInput.fill('naruto');

  await page.getByRole('button', { name: 'Apply Filters' }).click();

  await expect(page).toHaveURL(/sfw=false/);
  await expect(page).toHaveURL(/q=naruto/);

  await page.reload();

  // Wait for collapsible to open and verify state
  await page.getByRole('button', { name: 'Advanced Filters' }).click();
  await expect(page.getByPlaceholder('Search for an anime...')).toHaveValue(
    'naruto'
  );
  await expect(page.getByLabel('Safe for Work only')).not.toBeChecked();
});

test('updates page param when loading more results', async ({ page }) => {
  await page.goto('/discover');

  // Wait for anime grid to be visible first
  await expect(page.getByRole('img').first()).toBeVisible({ timeout: 20000 });

  const loadMore = page.getByRole('button', { name: 'Load More' });
  await expect(loadMore).toBeVisible({ timeout: 5000 });

  await loadMore.click();
  await expect(page).toHaveURL(/page=2/);
});
