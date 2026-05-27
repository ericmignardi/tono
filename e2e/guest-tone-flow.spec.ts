import { test, expect } from '@playwright/test';

test.describe('Guest tone generation', () => {
  test('happy path: fills the form, mocks API, and shows generated knobs', async ({ page }) => {
    // Intercept the API so we don't burn real Gemini / rate limit quotas in CI.
    await page.route('**/api/tones/guest', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Tone generated successfully',
          data: {
            ampSettings: {
              gain: 7,
              treble: 6,
              mid: 5,
              bass: 4,
              volume: 7,
              presence: 5,
              reverb: 3,
            },
            notes: 'Vintage tone profile',
          },
        }),
      });
    });

    await page.goto('/');

    await page.getByLabel(/Artist \/ Song/i).fill('Hendrix');
    await page.getByLabel(/Your Guitar/i).fill('Strat');
    await page.getByLabel(/Your Amp/i).fill('Marshall');

    await page.getByRole('button', { name: /Generate Free Tone/i }).click();

    await expect(page.getByText(/Tone Generated!/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Sign Up to Save/i })).toBeVisible();
  });

  test('rate-limit path: 429 surfaces the daily-limit upgrade UI', async ({ page }) => {
    await page.route('**/api/tones/guest', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Guest limit reached. Please sign in to create more tones!',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
      });
    });

    await page.goto('/');

    await page.getByLabel(/Artist \/ Song/i).fill('Hendrix');
    await page.getByLabel(/Your Guitar/i).fill('Strat');
    await page.getByLabel(/Your Amp/i).fill('Marshall');

    await page.getByRole('button', { name: /Generate Free Tone/i }).click();

    await expect(page.getByText(/Daily Limit Reached!/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Sign Up to Save/i })).toBeVisible();
  });

  test('client-side validation: empty fields block submission', async ({ page }) => {
    let apiHits = 0;
    await page.route('**/api/tones/guest', async (route) => {
      apiHits++;
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Generate Free Tone/i }).click();

    // Zod errors render under the inputs — at least one should be visible
    await expect(page.locator('p').filter({ hasText: /required|too short|invalid/i }).first()).toBeVisible({
      timeout: 5000,
    });
    expect(apiHits).toBe(0);
  });
});
