// @ts-check
import { expect, test } from '@playwright/test';

test.describe('TASK-002 — Thème clair/sombre', () => {
  test('bascule le thème et l’indique au bouton', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByTestId('theme-toggle');

    await expect(page.locator('body')).not.toHaveClass(/theme-dark/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(page.locator('body')).toHaveClass(/theme-dark/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await toggle.click();
    await expect(page.locator('body')).not.toHaveClass(/theme-dark/);
  });

  test('conserve le choix après rechargement', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('theme-toggle').click();
    await page.reload();

    await expect(page.locator('body')).toHaveClass(/theme-dark/);
  });

  test('change réellement les couleurs de la page', async ({ page }) => {
    await page.goto('/');
    const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const before = await background();

    await page.getByTestId('theme-toggle').click();
    await expect.poll(background).not.toBe(before);
  });
});
