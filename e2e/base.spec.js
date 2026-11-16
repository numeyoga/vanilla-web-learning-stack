// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Socle de l’application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche les participants initiaux triés par nom', async ({ page }) => {
    const names = page.getByTestId('participant-name');
    await expect(names).toHaveCount(6);
    await expect(names.first()).toHaveText('Alice Martin');
    await expect(names.last()).toHaveText('Fabien Morel');
  });

  test('ajoute un participant à la liste', async ({ page }) => {
    await page.getByTestId('name-input').fill('Gaëlle Perrin');
    await page.getByTestId('role-select').selectOption('Testeur');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByTestId('participant-item')).toHaveCount(7);
    await expect(page.getByTestId('participant-name').filter({ hasText: 'Gaëlle Perrin' })).toBeVisible();
  });

  test('affiche une erreur si le nom est vide', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByTestId('form-error')).toHaveText('Le nom est obligatoire.');
    await expect(page.getByTestId('participant-item')).toHaveCount(6);
  });
});
