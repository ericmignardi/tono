import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔍 Starting authentication flow...');

    // Go to your app
    await page.goto(baseURL || 'http://localhost:3000');
    console.log('✅ Navigated to home page');

    // Click sign in
    await page.getByRole('button', { name: /Sign In/i }).click();
    console.log('✅ Clicked Sign in button');

    // Wait for Clerk's sign-in page
    await page.waitForURL(/sign-in/);
    console.log('✅ Reached Clerk sign-in page');

    // Fill in email and click continue
    const email = process.env.TEST_USER_EMAIL || '';
    console.log(`📧 Filling email: ${email}`);
    await page.locator('input[name="identifier"]').fill(email);
    await page.locator('button[data-localization-key="formButtonPrimary"]').first().click();
    console.log('✅ Submitted email');

    // Wait for the password field to appear
    await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    console.log('✅ Password field appeared');

    // Fill in password
    const password = process.env.TEST_USER_PASSWORD || '';
    console.log('🔒 Filling password');
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[data-localization-key="formButtonPrimary"]').first().click();
    console.log('✅ Submitted password');

    // Wait for redirect
    await page.waitForTimeout(3000);
    console.log(`📍 Current URL after login: ${page.url()}`);

    // Navigate to dashboard to ensure we're authenticated
    console.log('🔄 Navigating to /dashboard...');
    await page.goto(`${baseURL}/dashboard`);
    await page.waitForLoadState('networkidle');
    console.log(`📍 Final URL: ${page.url()}`);

    // Save the authenticated state
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
    console.log('✅ Authentication successful - session saved');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    await page.screenshot({ path: 'playwright/.auth/auth-failure.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
