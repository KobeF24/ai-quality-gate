import { expect, test as setup } from '@playwright/test';

const authFile = '.auth/client.json';

setup('S — log in as Léa and save the session', async ({ page }) => {
  const response = await page.request.post('/api/login', {
    data: { email: 'lea@demo.test', orderId: 'ORD-1002' },
  });
  await expect(response).toBeOK();

  // Proof assertion BEFORE saving: never persist a session we have not seen work.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bonjour Léa' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
