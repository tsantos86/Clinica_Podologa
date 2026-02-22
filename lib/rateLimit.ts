/**
 * Rate limiter simples em memória
 * Para produção, usar Redis ou similar
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

interface RateLimitConfig {
  /** Máximo de requisições na janela */
  maxRequests: number;
  /** Janela de tempo em milissegundos */
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  // API pública - booking
  booking: { maxRequests: 10, windowMs: 60 * 1000 },       // 10/min
  // Envio de email
  email: { maxRequests: 3, windowMs: 60 * 1000 },          // 3/min
  // Login
  login: { maxRequests: 5, windowMs: 5 * 60 * 1000 },      // 5 em 5min
  // APIs gerais
  general: { maxRequests: 60, windowMs: 60 * 1000 },       // 60/min
  // Testemunhos
  testimonials: { maxRequests: 5, windowMs: 60 * 1000 },   // 5/min
};

/**
 * Obtém o IP do cliente a partir dos headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

/**
 * Verifica rate limit para um identificador
 * @returns true se dentro do limite, false se excedeu
 */
export function checkRateLimit(
  identifier: string,
  configName: string = 'general'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = DEFAULT_CONFIGS[configName] || DEFAULT_CONFIGS.general;
  const key = `${configName}:${identifier}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Nova janela
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Helper para usar em API routes do Next.js
 * Retorna NextResponse de erro 429 se excedeu, ou null se OK
 */
export function rateLimitResponse(
  request: Request,
  configName: string = 'general'
): Response | null {
  const ip = getClientIp(request);
  const { allowed, remaining, resetIn } = checkRateLimit(ip, configName);

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas requisições. Por favor, aguarde e tente novamente.',
        retryAfter: Math.ceil(resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
        },
      }
    );
  }

  return null;
}
