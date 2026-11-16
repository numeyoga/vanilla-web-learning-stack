// @ts-check
import { expect, test } from '@playwright/test';

test.describe('TASK-003 — Recherche par nom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filtre la liste pendant la saisie', async ({ page }) => {
    await page.getByTestId('search-input').fill('chlo');

    await expect(page.getByTestId('participant-item')).toHaveCount(1);
    await expect(page.getByTestId('participant-name')).toHaveText('Chloé Favre');
  });

  test('affiche un message quand rien ne correspond', async ({ page }) => {
    await page.getByTestId('search-input').fill('zzz');

    await expect(page.getByTestId('participant-item')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toContainText('Aucun participant ne correspond');
  });

  test('réaffiche toute la liste quand la recherche est effacée', async ({ page }) => {
    const search = page.getByTestId('search-input');
    await search.fill('zzz');
    await search.fill('');

    await expect(page.getByTestId('participant-item')).toHaveCount(6);
    await expect(page.getByTestId('empty-state')).toBeHidden();
  });
});
