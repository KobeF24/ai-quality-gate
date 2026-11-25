import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('T1 — the page renders its title, main landmark and an enabled question field', async ({ page }) => {
  await expect(page).toHaveTitle('Aide Commande');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Votre question' })).toBeEnabled();
});

test('T2 — an empty message is blocked with an accessible error', async ({ page }) => {
  const requestedUrls: string[] = [];
  page.on('request', (request) => requestedUrls.push(request.url()));

  await page.getByRole('button', { name: 'Envoyer' }).click();

  const question = page.getByRole('textbox', { name: 'Votre question' });
  await expect(question).toHaveAttribute('aria-invalid', 'true');
  await expect(question).toHaveAccessibleDescription("Saisissez une question avant d'envoyer.");
  await expect(page.getByText("Saisissez une question avant d'envoyer.")).toBeVisible();
  expect(requestedUrls.filter((url) => url.endsWith('/api/chat'))).toHaveLength(0);
});

test('T3 — a server error shows a message, and "Réessayer" recovers', async ({ page }) => {
  // Only the first call fails; the retry reaches the real (mock-mode) server.
  await page.route('**/api/chat', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }), {
    times: 1,
  });

  await page.getByRole('textbox', { name: 'Votre question' }).fill('Où est ma commande ?');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByText("L'assistant est momentanément indisponible.")).toBeVisible();

  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.getByRole('region', { name: "Réponse de l'assistant" })).toContainText(
    'Réponse de démonstration',
  );
  await expect(page.getByText("L'assistant est momentanément indisponible.")).toBeHidden();
});

test('T4 — a slow reply shows the loading indicator, then the reply replaces it', async ({ page }) => {
  // The test decides when the reply arrives: no sleep, no timing guess.
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/api/chat', async (route) => {
    await released;
    await route.continue();
  });

  await page.getByRole('textbox', { name: 'Votre question' }).fill('Quel est le délai de retour ?');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByRole('status')).toHaveText('Réponse en cours…');

  release();
  await expect(page.getByRole('region', { name: "Réponse de l'assistant" })).toContainText(
    'Réponse de démonstration',
  );
  await expect(page.getByRole('status')).toBeHidden();
});
