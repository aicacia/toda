import { expect, test } from '@playwright/test';

test('body is visible and hydrated', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('body.hydrated')).toBeVisible();
});
