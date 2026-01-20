import { test, expect } from '@playwright/test';

test.describe('Inventory Adjustment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/adjustment');
  });

  test('should display page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Adjustment' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by sku/i)).toBeVisible();
  });

  test('should display products in table', async ({ page }) => {
    // Wait for products to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check for table headers
    await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Product Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Stock' })).toBeVisible();
  });

  test('should filter products when searching', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by sku/i);
    
    // Type search query
    await searchInput.fill('wireless');
    
    // Wait for debounce and results
    await page.waitForTimeout(400);
    
    // Should show filtered results
    const rows = page.locator('tbody tr.data-row');
    await expect(rows).toHaveCount(1); // Only "Wireless Keyboard"
  });

  test('should open adjustment form when product is clicked', async ({ page }) => {
    // Click on first product row
    await page.locator('tbody tr.data-row').first().click();
    
    // Adjustment form should appear
    await expect(page.getByRole('heading', { name: 'Adjust Stock' })).toBeVisible();
  });

  test('should show stock change summary', async ({ page }) => {
    // Click on first product
    await page.locator('tbody tr.data-row').first().click();
    
    // Wait for form to load
    await expect(page.getByLabel('New Stock Level')).toBeVisible();
    
    // Change stock value
    const stockInput = page.getByLabel('New Stock Level');
    await stockInput.clear();
    await stockInput.fill('200');
    
    // Should show change summary
    await expect(page.locator('.change-summary')).toBeVisible();
  });

  test('should validate stock input', async ({ page }) => {
    // Click on first product
    await page.locator('tbody tr.data-row').first().click();
    
    // Wait for form
    await expect(page.getByLabel('New Stock Level')).toBeVisible();
    
    // Enter negative value
    const stockInput = page.getByLabel('New Stock Level');
    await stockInput.clear();
    await stockInput.fill('-10');
    
    // Should show error
    await expect(page.getByText('Stock cannot be negative')).toBeVisible();
    
    // Submit button should be disabled
    await expect(page.getByRole('button', { name: /confirm adjustment/i })).toBeDisabled();
  });

  test('should close form when cancel is clicked', async ({ page }) => {
    // Click on first product
    await page.locator('tbody tr.data-row').first().click();
    
    // Wait for form
    await expect(page.getByRole('heading', { name: 'Adjust Stock' })).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Form should be closed
    await expect(page.getByRole('heading', { name: 'Adjust Stock' })).not.toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('should display quick stats', async ({ page }) => {
    await expect(page.getByText('Total Products')).toBeVisible();
    await expect(page.getByText('Low Stock Alerts')).toBeVisible();
    await expect(page.getByText('Out of Stock')).toBeVisible();
  });

  test('should navigate to inventory adjustment', async ({ page }) => {
    await page.getByRole('link', { name: /adjust inventory/i }).click();
    
    await expect(page).toHaveURL(/inventory\/adjustment/);
    await expect(page.getByRole('heading', { name: 'Inventory Adjustment' })).toBeVisible();
  });
});
