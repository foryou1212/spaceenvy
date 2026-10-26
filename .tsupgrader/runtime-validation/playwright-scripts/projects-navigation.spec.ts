import { test, expect } from '@playwright/test';

test.use({ channel: 'msedge' });

test('projects-navigation', async ({ page }) => {
  await page.route("**/*", async route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === "http://localhost:3000") {
      await route.continue();
    } else {
      await route.abort("blockedbyclient");
    }
  });
  await page.goto('http://localhost:3000');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page.getByRole('main')).toHaveText("Ideas taking shapeProjects, at every stage.A look at the spaces we’re working on and the ones ready to welcome their next chapter.Upcoming projectsCompleted projectsOn the drawing boardUpcoming projects0 projectsNo upcoming projects are published right now. Check back soon, or tell us about your space.Ready to be lived inCompleted projects0 projectsCompleted project stories will appear here as they are added. Start a project with us.");
});
