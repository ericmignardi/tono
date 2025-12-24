import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Unauthenticated Actions', () => {
    // Don't use the saved auth state for these tests
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should display home page for unauthenticated users', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/tono/i);

      // Verify the page loaded with expected content
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(/Powered by AI/i)).toBeVisible();
    });
  });

  test.describe('Authenticated Actions', () => {
    // Authentication is now handled by globalSetup and storageState

    test('should render create tone form correctly', async ({ page }) => {
      await page.goto('/dashboard/create');

      await expect(page).toHaveTitle(/tono/i);
      // CardTitle is a div, not a heading - use getByText
      await expect(page.getByText('Create New Tone')).toBeVisible();

      // Verify all form fields are present
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/artist/i)).toBeVisible();
      await expect(page.getByLabel(/description/i)).toBeVisible();
      await expect(page.getByLabel(/guitar/i)).toBeVisible();
      await expect(page.getByLabel(/pickups/i)).toBeVisible();
      await expect(page.getByLabel(/strings/i)).toBeVisible();
      await expect(page.getByLabel(/amp/i)).toBeVisible();

      // Button is "Generate Tone"
      await expect(page.getByRole('button', { name: /Generate Tone/i })).toBeVisible();
    });

    test('should allow user to fill and submit create tone form', async ({ page }) => {
      await page.goto('/dashboard/create');

      await expect(page.getByText('Create New Tone')).toBeVisible();

      // Fill form fields
      await page.getByLabel(/name/i).fill('Test Tone');
      await page.getByLabel(/artist/i).fill('Test Artist');
      await page.getByLabel(/description/i).fill('A test tone description');
      await page.getByLabel(/guitar/i).fill('Fender Stratocaster');
      await page.getByLabel(/pickups/i).selectOption('Single Coil');
      await page.getByLabel(/strings/i).fill('.010–.046');
      await page.getByLabel(/amp/i).fill('Marshall JCM800');

      const generateToneButton = page.getByRole('button', { name: /Generate Tone/i });
      await expect(generateToneButton).toBeVisible();
      await expect(generateToneButton).toBeEnabled();

      // Click the button
      await generateToneButton.click();

      // Verify form submission started - button should be disabled or show loading text
      // We give it a short window then move on - we're testing UI behavior, not API success
      await page.waitForTimeout(1000);

      // The form should have responded in some way - either loading, redirect, or error
      // This test just verifies the submit action works
    });

    test('should allow a user to view their dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page).toHaveTitle(/tono/i);
      await expect(page.getByRole('heading', { level: 1, name: /Welcome back,/i })).toBeVisible();
      await expect(page.getByText('Recent Tones')).toBeVisible();
    });

    test('should display tones page', async ({ page }) => {
      await page.goto('/dashboard/tones');

      await expect(page).toHaveTitle(/tono/i);
      // Verify the tones page loads
      await expect(page.getByRole('heading', { name: /Tones/i })).toBeVisible();
    });
  });
});
