import { test, expect } from './fixtures';

test('reads consent after hydration and preserves the stored choice', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/dashboard');
  const decline = page.getByRole('button', { name: 'Decline' });
  await expect(decline).toBeVisible();
  await decline.click();
  await expect(decline).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('link', { name: /open profile in app/i })
  ).toBeVisible();
  // A completed reload must not show the banner again or produce hydration errors.
  await expect(decline).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      localStorage.getItem('anitrend_analytics_consent')
    )
  ).toBe('denied');
  expect(errors).toEqual([]);
});
