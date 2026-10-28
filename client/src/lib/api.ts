export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string[]>) {
    super(message);
  }
}

type Opts = { method?: string; json?: unknown; form?: FormData };

// Todas las peticiones llevan el encabezado anti-CSRF y envían la cookie de sesión.
export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { 'X-Requested-With': 'sl-web' };
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts.form) body = opts.form;

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { method: opts.method ?? (body ? 'POST' : 'GET'), headers, body, credentials: 'include' });
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Ocurrió un error inesperado.', data.fields);
  return data as T;
}
