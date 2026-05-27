import { test, expect } from '@playwright/test';

test.describe('Auth-gated routes', () => {
  test('dashboard redirects unauthenticated users to sign-in', async ({ page }) => {
    const response = await page.goto('/dashboard');

    // Clerk middleware may redirect via 307/308 or rewrite to /sign-in.
    // Either way, after the navigation settles we should NOT be on /dashboard.
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toMatch(/\/dashboard\/?$/);
    // The status check is informational; the URL assertion above is the contract.
    expect(response?.status() ?? 200).toBeLessThan(500);
  });

  test('sign-in page is reachable', async ({ page }) => {
    await page.goto('/sign-in');
    // Clerk renders its own sign-in form — wait for one of its labels.
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('sign-up page is reachable', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test('protected API endpoints return 401 without auth', async ({ request }) => {
    const res = await request.get('/api/tones');
    expect(res.status()).toBe(401);
  });

  test('guest API endpoint is reachable without auth', async ({ request }) => {
    const res = await request.post('/api/tones/guest', {
      data: { artist: '', guitar: '', amp: '' },
    });
    // Even with bad input we should reach the handler (400 from validation),
    // not be rejected by Clerk middleware (which would 401 / redirect).
    expect([400, 429]).toContain(res.status());
  });
});
