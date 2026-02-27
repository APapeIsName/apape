import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';

function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return {
    headers: new Headers({
      'x-forwarded-for': ip,
    }),
  } as unknown as NextRequest;
}

describe('checkRateLimit', () => {
  let checkRateLimit: typeof import('@/lib/rate-limit').checkRateLimit;

  beforeEach(async () => {
    vi.useFakeTimers();
    // Re-import the module fresh each time to get a clean store
    vi.resetModules();
    const mod = await import('@/lib/rate-limit');
    checkRateLimit = mod.checkRateLimit;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should allow the first request', () => {
    const req = createMockRequest();
    const result = checkRateLimit(req, 'test-first', { limit: 5, windowSeconds: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should allow requests within the limit', () => {
    const req = createMockRequest();
    const options = { limit: 3, windowSeconds: 60 };

    const r1 = checkRateLimit(req, 'test-within', options);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(req, 'test-within', options);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(req, 'test-within', options);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('should block requests exceeding the limit', () => {
    const req = createMockRequest();
    const options = { limit: 2, windowSeconds: 60 };

    checkRateLimit(req, 'test-exceed', options);
    checkRateLimit(req, 'test-exceed', options);

    const r3 = checkRateLimit(req, 'test-exceed', options);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('should allow requests again after the window expires', () => {
    const req = createMockRequest();
    const options = { limit: 1, windowSeconds: 60 };

    const r1 = checkRateLimit(req, 'test-expire', options);
    expect(r1.allowed).toBe(true);

    const r2 = checkRateLimit(req, 'test-expire', options);
    expect(r2.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61_000);

    const r3 = checkRateLimit(req, 'test-expire', options);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('should track different IPs independently', () => {
    const req1 = createMockRequest('1.1.1.1');
    const req2 = createMockRequest('2.2.2.2');
    const options = { limit: 1, windowSeconds: 60 };

    const r1 = checkRateLimit(req1, 'test-ip', options);
    expect(r1.allowed).toBe(true);

    const r2 = checkRateLimit(req2, 'test-ip', options);
    expect(r2.allowed).toBe(true);

    // Now both should be blocked
    const r3 = checkRateLimit(req1, 'test-ip', options);
    expect(r3.allowed).toBe(false);

    const r4 = checkRateLimit(req2, 'test-ip', options);
    expect(r4.allowed).toBe(false);
  });

  it('should track different prefixes independently', () => {
    const req = createMockRequest();
    const options = { limit: 1, windowSeconds: 60 };

    const r1 = checkRateLimit(req, 'prefix-a', options);
    expect(r1.allowed).toBe(true);

    const r2 = checkRateLimit(req, 'prefix-b', options);
    expect(r2.allowed).toBe(true);
  });
});
