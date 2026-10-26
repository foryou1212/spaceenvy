import { test, expect } from '@playwright/test';

test.use({ channel: 'msedge' });

test('home-hero', async ({ page }) => {
  await page.route("**/*", async route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === "http://localhost:3000") {
      await route.continue();
    } else {
      await route.abort("blockedbyclient");
    }
  });
  await page.goto('http://localhost:3000');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).hover();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' })).toBeVisible();
});
