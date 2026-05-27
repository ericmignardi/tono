import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero, headline, and guest tone form', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/perfect/i);
    await expect(page.getByText(/Live Demo - No account required/i)).toBeVisible();
    await expect(page.getByText(/Powered by AI/i)).toBeVisible();
  });

  test('shows guest tone generator inputs', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel(/Artist \/ Song/i)).toBeVisible();
    await expect(page.getByLabel(/Your Guitar/i)).toBeVisible();
    await expect(page.getByLabel(/Your Amp/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate Free Tone/i })).toBeVisible();
  });

  test('exposes sign-in and sign-up entry points', async ({ page }) => {
    await page.goto('/');

    // SignedOut buttons (Clerk renders them in the header)
    await expect(page.getByRole('button', { name: /^Sign In$/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Sign Up$/i }).first()).toBeVisible();
  });

  test('renders pricing section', async ({ page }) => {
    await page.goto('/');

    // Scroll to the pricing anchor
    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await expect(page.locator('#pricing')).toBeVisible();
  });
});
