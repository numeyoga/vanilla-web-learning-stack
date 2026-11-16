// @ts-check
import { expect, test } from '@playwright/test';

test.describe('TASK-004 — Badge « Nouveau »', () => {
  test('aucun participant initial n’a de badge', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('new-badge')).toHaveCount(0);
  });

  test('un participant ajouté porte le badge « Nouveau »', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('name-input').fill('Gaëlle Perrin');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    const item = page.getByTestId('participant-item').filter({ hasText: 'Gaëlle Perrin' });
    await expect(item.getByTestId('new-badge')).toHaveText('Nouveau');
    await expect(page.getByTestId('new-badge')).toHaveCount(1);
  });
});
