import { expect, test } from '@playwright/test';

test('T5 — POST /api/chat without a body returns 400 with an { error } shape', async ({ request }) => {
  const response = await request.post('/api/chat');

  expect(response.status()).toBe(400);
  expect((await response.json()) as unknown).toEqual({ error: expect.any(String) as unknown });
});

test('T6 — GET /api/orders/ORD-9999 returns 404', async ({ request }) => {
  const response = await request.get('/api/orders/ORD-9999');

  expect(response.status()).toBe(404);
});
