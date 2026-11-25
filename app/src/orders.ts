import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

export type OrderStatus = 'confirmed' | 'shipped' | 'delivered' | 'return_in_progress' | 'refunded';

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  status: OrderStatus;
  orderedAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  total: number;
}

export interface Customer {
  email: string;
  firstName: string;
  language: 'fr' | 'it' | 'es';
}

const dataDir = new URL('../data/', import.meta.url);

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(new URL(file, dataDir), 'utf8')) as T;
}

const customers = readJson<Customer[]>('customers.json');

// In-memory copy: test seeding never touches the JSON files on disk.
const orders = new Map<string, Order>(readJson<Order[]>('orders.json').map((o) => [o.id, o]));

export function findCustomer(email: string): Customer | undefined {
  return customers.find((c) => c.email === email);
}

export function ordersOf(email: string): Order[] {
  return [...orders.values()]
    .filter((o) => o.customerEmail === email)
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
}

export function lastOrderOf(email: string): Order | undefined {
  return ordersOf(email)[0];
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function seedOrder(email: string): Order {
  const order: Order = {
    id: `ORD-T-${randomUUID()}`,
    customerEmail: email,
    status: 'confirmed',
    orderedAt: new Date().toISOString().slice(0, 10),
    items: [{ name: 'Article de test', quantity: 1, unitPrice: 10 }],
    total: 10,
  };
  orders.set(order.id, order);
  return order;
}

export function deleteOrder(id: string, email: string): boolean {
  const order = orders.get(id);
  if (!order || order.customerEmail !== email) return false;
  return orders.delete(id);
}

export const statusLabel: Record<OrderStatus, string> = {
  confirmed: 'confirmée',
  shipped: 'expédiée',
  delivered: 'livrée',
  return_in_progress: 'retour en cours',
  refunded: 'remboursée',
};
