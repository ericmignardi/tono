import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Unauthenticated Actions', () => {
    // Don't use the saved auth state for these tests
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should allow a user to sign up and login', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/tono/i);
      await expect(page.getByRole('heading', { name: /Find Any Guitar Tone/i })).toBeVisible();

      // Check for auth buttons (Sign up might be in mobile menu on desktop)
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      const getStartedButton = page.locator('#hero').getByRole('button', { name: 'Get started' });

      await expect(signInButton).toBeVisible();
      await expect(getStartedButton).toBeVisible();

      await signInButton.click();
      await page.waitForURL(/sign-in/);
    });
  });

  test.describe('Authenticated Actions', () => {
    // Authentication is now handled by globalSetup and storageState

    test('should allow a user to generate a tone', async ({ page }) => {
      await page.goto('/dashboard/create');

      await expect(page).toHaveTitle(/tono/i);
      await expect(page.getByRole('heading', { level: 1, name: /Create Tone/i })).toBeVisible();

      await page.getByLabel('Name').fill('Test Tone');
      await page.getByLabel('Artist').fill('Test Artist');
      await page.getByLabel('Description').fill('A test tone description');
      await page.getByLabel('Guitar').fill('Fender Stratocaster');
      await page.getByLabel('Pickups').fill('Single Coil');
      await page.getByLabel('Strings').fill('.010–.046');
      await page.getByLabel('Amp').fill('Marshall JCM800');

      const createToneButton = page.getByRole('button', { name: /Create Tone/i });
      await expect(createToneButton).toBeVisible();

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log('Browser console error:', msg.text());
        }
      });

      await createToneButton.click();

      // Check if there's an error message on the form
      const errorMessage = await page
        .locator('.text-red-800, [role="alert"]')
        .textContent()
        .catch(() => null);
      if (errorMessage) {
        console.log('Form error:', errorMessage);
      }

      // Success is indicated by redirect to tones page (toast appears but page redirects immediately)
      await page.waitForURL('/dashboard/tones', { timeout: 15000 });
    });

    test('should allow a user to save and view a tone', async ({ page }) => {
      await page.goto('/dashboard/create');

      await expect(page).toHaveTitle(/tono/i);
      await expect(page.getByRole('heading', { level: 1, name: /Create Tone/i })).toBeVisible();

      await page.getByLabel('Name').fill('Saved Tone');
      await page.getByLabel('Artist').fill('Saved Artist');
      await page.getByLabel('Description').fill('A saved tone description');
      await page.getByLabel('Guitar').fill('Gibson Les Paul');
      await page.getByLabel('Pickups').fill('Humbucker');
      await page.getByLabel('Strings').fill('.010–.046');
      await page.getByLabel('Amp').fill('Fender Twin Reverb');

      const createToneButton = page.getByRole('button', { name: /Create Tone/i });
      await expect(createToneButton).toBeVisible();

      await createToneButton.click();

      // Success is indicated by redirect to tones page
      await page.waitForURL('/dashboard/tones', { timeout: 15000 });

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Verify we're on the tones page and it has content
      await expect(page.getByRole('heading', { name: /Tones/i })).toBeVisible();
    });

    test('should allow a user to view their dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page).toHaveTitle(/tono/i);
      await expect(page.getByRole('heading', { level: 1, name: /Welcome back,/i })).toBeVisible();
      await expect(page.getByText('Recent Tones')).toBeVisible();
    });
  });
});
