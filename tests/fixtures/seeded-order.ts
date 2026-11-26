import { test as base } from '@playwright/test';
import type { Order } from '../../app/src/orders.ts';

const seedHeaders = { 'X-Test-Seed': '1' };

// Test-scoped (cheap, mutable resource), not auto (it acquires a resource). Spec §5.4.
export const test = base.extend<{ seededOrder: Order }>({
  seededOrder: async ({ page }, use) => {
    // page.request shares the browser context cookies, so the order belongs to the logged-in client.
    const created = await page.request.post('/api/orders', { headers: seedHeaders });
    if (!created.ok()) throw new Error(`Seeding failed: HTTP ${created.status()}`);
    const order = (await created.json()) as Order;
    try {
      await use(order);
    } finally {
      // Idempotent and silent: a 404 (already gone) or a network error must not fail the test.
      await page.request
        .delete(`/api/orders/${order.id}`, { headers: seedHeaders })
        .catch(() => undefined);
    }
  },
});

export { expect } from '@playwright/test';
