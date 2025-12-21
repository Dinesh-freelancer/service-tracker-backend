import { test, expect } from '@playwright/test';

test.describe('Jobs List Functionality', () => {

  // 1. Sidebar Scrollbar Fix Verification
  test('Sidebar should not have horizontal scrollbar', async ({ page }) => {
    // Mock Login
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

    // Check Sidebar computed style for overflow-x
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveCSS('overflow-x', 'hidden');
  });

  // 2. Admin View Verification (RBAC)
  test('Admin should see Customer and Amount columns', async ({ page }) => {
    // Mock Jobs API Response
    await page.route('**/api/jobs?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            data: [
                { JobNumber: 'JOB001', CustomerName: 'John Doe', EstimatedAmount: 5000, Status: 'Received', DateReceived: '2023-01-01' }
            ],
            pagination: { page: 1, totalPages: 1 }
        })
      });
    });

    // Login as Admin
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

    // Navigate to Jobs
    await page.click('a[href="/dashboard/jobs"]');

    // Verify Columns
    await expect(page.locator('th:has-text("Customer")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
    await expect(page.locator('td:has-text("John Doe")')).toBeVisible();
    await expect(page.locator('td:has-text("₹5000")')).toBeVisible();
  });

  // 3. Worker View Verification (RBAC)
  test('Worker should NOT see Customer and Amount columns', async ({ page }) => {
     // Mock Jobs API Response for Worker
     await page.route('**/api/jobs?*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
              data: [
                  { JobNumber: 'JOB001', Status: 'Received', DateReceived: '2023-01-01' } // Worker API typically hides names, but frontend also hides column
              ],
              pagination: { page: 1, totalPages: 1 }
          })
        });
      });

      // Login as Worker
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

      // Navigate to Jobs
      await page.click('a[href="/dashboard/jobs"]');

      // Verify Columns are HIDDEN
      await expect(page.locator('th:has-text("Customer")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).not.toBeVisible();
      await expect(page.locator('td:has-text("John Doe")')).not.toBeVisible();
  });

});
