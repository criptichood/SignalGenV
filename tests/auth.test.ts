import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); // Assuming default Vite port
  });

  test('should show auth page when not authenticated', async ({ page }) => {
    // Initially should show auth page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should toggle between login and signup views', async ({ page }) => {
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Click on 'Don't have an account? Sign Up'
    await page.locator('text=Don\'t have an account? Sign Up').click();
    await expect(page.locator('text=Create an Account')).toBeVisible();
    
    // Toggle back to login
    await page.locator('text=Already have an account? Sign In').click();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    // Go to sign up view to see confirm password
    await page.locator('text=Don\'t have an account? Sign Up').click();
    
    // Check that eye icons are present
    await expect(page.locator('svg')).toHaveCount(2); // Two eye icons for password fields
  });

  test('should validate password requirements', async ({ page }) => {
    await page.locator('text=Don\'t have an account? Sign Up').click();
    
    // Enter an invalid password (too short)
    await page.locator('#password').fill('abc');
    await page.locator('#confirm-password').fill('abc');
    
    // Check password strength indicators
    await expect(page.locator('text=• At least 8 characters')).toHaveClass(/text-gray-500/);
    await expect(page.locator('text=• At least 1 uppercase letter')).toHaveClass(/text-gray-500/);
    await expect(page.locator('text=• At least 1 lowercase letter')).toHaveClass(/text-gray-500/);
    await expect(page.locator('text=• At least 1 symbol')).toHaveClass(/text-gray-500/);
    
    // Enter a valid password
    await page.locator('#password').fill('Test@1234');
    await page.locator('#confirm-password').fill('Test@1234');
    
    // Check that requirements are met
    await expect(page.locator('text=• At least 8 characters')).toHaveClass(/text-green-400/);
    await expect(page.locator('text=• At least 1 uppercase letter')).toHaveClass(/text-green-400/);
    await expect(page.locator('text=• At least 1 lowercase letter')).toHaveClass(/text-green-400/);
    await expect(page.locator('text=• At least 1 symbol')).toHaveClass(/text-green-400/);
  });
});