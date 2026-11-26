// Promptfoo custom provider: talks to the running app over HTTP, exactly like a browser would.
// It logs in when the case has a session, so the assistant receives that customer's order context.

interface ProviderOptions {
  config?: { baseUrl?: string };
}

interface CallContext {
  vars: Record<string, unknown>;
}

interface ProviderResponse {
  output?: string;
  error?: string;
}

interface Credentials {
  email: string;
  orderId: string;
}

// "lucia@demo.test (ORD-1006, confirmée)" -> credentials; "anonymous" -> undefined.
function parseSession(raw: unknown): Credentials | undefined {
  if (typeof raw !== 'string') return undefined;
  const match = /^(\S+@\S+)\s+\((ORD-\d+)/.exec(raw);
  const [, email, orderId] = match ?? [];
  return email && orderId ? { email, orderId } : undefined;
}

export default class AideCommandeProvider {
  private baseUrl: string;

  constructor(options: ProviderOptions = {}) {
    this.baseUrl = options.config?.baseUrl ?? 'http://localhost:3000';
  }

  id(): string {
    return 'aide-commande-live';
  }

  async callApi(prompt: string, context?: CallContext): Promise<ProviderResponse> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      const credentials = parseSession(context?.vars.session);
      if (credentials) {
        const login = await fetch(`${this.baseUrl}/api/login`, {
          method: 'POST',
          headers,
          body: JSON.stringify(credentials),
        });
        if (!login.ok) return { error: `Login failed for ${credentials.email}: HTTP ${login.status}` };
        const cookie = login.headers.get('set-cookie')?.split(';')[0];
        if (cookie) headers.Cookie = cookie;
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: prompt }),
      });
      const body = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || body.reply === undefined) {
        return { error: body.error ?? `HTTP ${response.status}` };
      }
      return { output: body.reply };
    } catch (error) {
      // Most often: the app is not running. Start it with `npm run start:live`.
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}
