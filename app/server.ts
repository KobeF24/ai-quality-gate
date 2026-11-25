import express, { type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { callModel, mockModel } from './src/assistant.ts';
import {
  deleteOrder,
  findCustomer,
  getOrder,
  lastOrderOf,
  ordersOf,
  seedOrder,
  statusLabel,
} from './src/orders.ts';

const MODE = process.env.MODE === 'live' ? 'live' : 'mock';
const PORT = Number(process.env.PORT ?? 3000);
// Demo-only default: no real data sits behind this session.
const SECRET = process.env.SESSION_SECRET ?? 'demo-only-session-secret';
const COOKIE = 'sid';

const app = express();
app.use(express.json());
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));

// --- Session: email + HMAC signature in a cookie, no external provider ---
function sign(value: string): string {
  return `${value}.${createHmac('sha256', SECRET).update(value).digest('base64url')}`;
}

function sessionEmail(req: Request): string | undefined {
  const raw = req.headers.cookie
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return undefined;
  const value = decodeURIComponent(raw);
  const email = value.slice(0, value.lastIndexOf('.'));
  const expected = Buffer.from(sign(email));
  const received = Buffer.from(value);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return undefined;
  return findCustomer(email) ? email : undefined;
}

function isTestSeed(req: Request): boolean {
  return req.get('X-Test-Seed') === '1';
}

// --- API ---
app.post('/api/login', (req: Request, res: Response) => {
  const { email, orderId } = (req.body ?? {}) as { email?: unknown; orderId?: unknown };
  const customer = typeof email === 'string' ? findCustomer(email.trim().toLowerCase()) : undefined;
  const order = typeof orderId === 'string' ? getOrder(orderId.trim().toUpperCase()) : undefined;
  if (!customer || order?.customerEmail !== customer.email) {
    res.status(401).json({ error: 'Email ou numéro de commande incorrect.' });
    return;
  }
  res.cookie(COOKIE, sign(customer.email), { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ firstName: customer.firstName });
});

app.post('/api/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.status(204).end();
});

app.get('/api/me', (req: Request, res: Response) => {
  const email = sessionEmail(req);
  const customer = email ? findCustomer(email) : undefined;
  if (!email || !customer) {
    res.status(401).json({ error: 'Non connecté.' });
    return;
  }
  const last = lastOrderOf(email);
  res.json({
    firstName: customer.firstName,
    lastOrder: last && { ...last, statusLabel: statusLabel[last.status] },
  });
});

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message } = (req.body ?? {}) as { message?: unknown };
  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'Le champ "message" est obligatoire.' });
    return;
  }
  const email = sessionEmail(req);
  const order = email ? lastOrderOf(email) : undefined;
  try {
    const reply = MODE === 'live' ? await callModel(message, order) : mockModel(message, order);
    res.json({ reply });
  } catch {
    res.status(502).json({ error: "L'assistant est momentanément indisponible." });
  }
});

app.get('/api/orders', (req: Request, res: Response) => {
  const email = sessionEmail(req);
  if (!email) {
    res.status(401).json({ error: 'Non connecté.' });
    return;
  }
  res.json(ordersOf(email).map((o) => ({ ...o, statusLabel: statusLabel[o.status] })));
});

app.get('/api/orders/:id', (req: Request<{ id: string }>, res: Response) => {
  const email = sessionEmail(req);
  const order = getOrder(req.params.id);
  // Same 404 whether the order is missing or belongs to someone else.
  if (!email || order?.customerEmail !== email) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }
  res.json(order);
});

// Test-only seeding (spec §3.4): requires the X-Test-Seed header in every mode.
app.post('/api/orders', (req: Request, res: Response) => {
  const email = sessionEmail(req);
  if (!isTestSeed(req) || !email) {
    res.status(403).json({ error: 'Réservé aux tests.' });
    return;
  }
  res.status(201).json(seedOrder(email));
});

app.delete('/api/orders/:id', (req: Request<{ id: string }>, res: Response) => {
  const email = sessionEmail(req);
  if (!isTestSeed(req) || !email) {
    res.status(403).json({ error: 'Réservé aux tests.' });
    return;
  }
  if (!deleteOrder(req.params.id, email)) {
    res.status(404).json({ error: 'Commande introuvable.' });
    return;
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Aide Commande sur http://localhost:${PORT} (MODE=${MODE})`);
});
