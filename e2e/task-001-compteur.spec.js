// @ts-check
import { expect, test } from '@playwright/test';

test.describe('TASK-001 — Compteur de participants', () => {
  test('affiche le nombre de participants dans l’en-tête', async ({ page }) => {
    await page.goto('/');
    const counter = page.locator('header').getByTestId('participant-count');
    await expect(counter).toHaveText('6 participants');
  });

  test('se met à jour après un ajout', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('name-input').fill('Gaëlle Perrin');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByTestId('participant-count')).toHaveText('7 participants');
  });
});
