import { expect, test } from '../fixtures/seeded-order.ts';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('T7 — the greeting and the last order summary are shown', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Bonjour Léa' })).toBeVisible();
  await expect(page.getByText('Dernière commande : ORD-1002 — livrée — 142.00 €')).toBeVisible();
});

test("T8 — the assistant receives the client's order context", async ({ page }) => {
  // The most important test of layer 1: the mock echoes the order id it was given,
  // so this proves the order context is assembled and sent to the assistant.
  await page.getByRole('textbox', { name: 'Votre question' }).fill('Où en est ma commande ?');
  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.getByRole('region', { name: "Réponse de l'assistant" })).toContainText(
    'Commande ORD-1002',
  );
});

test('T9 — a seeded order appears in the order list', async ({ page, seededOrder }) => {
  // The order was created after the first page load: reload to see it.
  await page.reload();

  await expect(page.getByRole('list', { name: 'Mes commandes' })).toContainText(seededOrder.id);
});

test('T10 — after logout, the client area is replaced by the login form', async ({ page }) => {
  await page.getByRole('button', { name: 'Se déconnecter' }).click();

  await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bonjour Léa' })).toBeHidden();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
});
