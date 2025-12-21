import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {

  // 1. Admin Dashboard Verification
  test('Admin should see Stats, Charts and Admin Quick Actions', async ({ page }) => {
    // Mock Login (Simulate successful login response and set localStorage)
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin-token', Role: 'Admin' })
      });
    });

    // Go to Login
    await page.goto('http://localhost:5173/login');

    // Fill Login Form
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirection to dashboard
    await page.waitForURL('**/dashboard');

    // Verify Dashboard Layout
    await expect(page.locator('text=ServicePortal')).toBeVisible(); // Sidebar Logo
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible(); // Header

    // Verify Admin-Specific Widgets
    await expect(page.locator('text=Total Jobs')).toBeVisible(); // Stats
    await expect(page.locator('text=Revenue Trend')).toBeVisible(); // Charts

    // Verify Quick Actions (Admin specific)
    await expect(page.locator('button:has-text("New Job")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Customer")')).toBeVisible();

    // Take Screenshot
    await page.screenshot({ path: 'verification/dashboard_admin.png' });
  });

  // 2. Worker Dashboard Verification
  test('Worker should see My Active Jobs and Worker Quick Actions', async ({ page }) => {
     // Mock Login for Worker
     await page.route('**/auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'fake-worker-token', Role: 'Worker' })
        });
      });

      await page.goto('http://localhost:5173/login');
      await page.fill('input[name="username"]', 'worker');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');

      // Verify Worker Specifics
      await expect(page.locator('text=My Active Jobs')).toBeVisible();

      // Verify Worker Quick Actions
      await expect(page.locator('button:has-text("Update Job")')).toBeVisible();
      await expect(page.locator('button:has-text("Log Work")')).toBeVisible();

      // Verify Admin features are ABSENT
      await expect(page.locator('text=Revenue Trend')).not.toBeVisible();
      await expect(page.locator('button:has-text("New Job")')).not.toBeVisible();

      // Take Screenshot
      await page.screenshot({ path: 'verification/dashboard_worker.png' });
  });

  // 3. Navigation & Notification Verification
  test('Should navigate to placeholder pages and show notifications', async ({ page }) => {
    // Mock Login as Admin
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin-token', Role: 'Admin' })
      });
    });

    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Test Navigation to 'Jobs' (Placeholder)
    await page.click('a[href="/dashboard/jobs"]');
    await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible(); // Actually JobsList now
    // Since we implemented JobsList, this test needs update if it expected Placeholder.
    // But since the routing points to JobsList now, checking for "Jobs" heading is safe.

    // Test Notification Click
    await page.click('button:has-text("") svg.lucide-bell');

    // Test Theme Toggle (Visual check via class)
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    // Find theme toggle button (Sun/Moon icon)
    await page.click('button[aria-label="Toggle theme"]');
    await expect(html).toHaveClass(/dark/);
  });

});
