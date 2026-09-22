import { test, expect } from '@playwright/test';
test('password recovery clearly reports unavailability', async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: 'Password recovery unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to login' })).toHaveAttribute('href', '/login');
});
