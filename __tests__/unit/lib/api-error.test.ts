import { describe, it, expect } from 'vitest';
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  rateLimited,
  internalError,
  badGateway,
} from '@/lib/api-error';

describe('API Error Helpers', () => {
  it('badRequest returns status 400 with code VALIDATION_ERROR', async () => {
    const response = badRequest('Invalid input');
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Invalid input');
    expect(body.error.requestId).toBeDefined();
  });

  it('unauthorized returns status 401 with code UNAUTHORIZED', async () => {
    const response = unauthorized();
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toBe('Authentication required');
  });

  it('forbidden returns status 403 with code FORBIDDEN', async () => {
    const response = forbidden();
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBe('Insufficient permissions');
  });

  it('notFound returns status 404 with code NOT_FOUND', async () => {
    const response = notFound();
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Resource not found');
  });

  it('conflict returns status 409 with code CONFLICT', async () => {
    const response = conflict('Resource already exists');
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe('CONFLICT');
    expect(body.error.message).toBe('Resource already exists');
  });

  it('validationError returns status 422 with code VALIDATION_ERROR', async () => {
    const response = validationError('Field is invalid');
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Field is invalid');
  });

  it('rateLimited returns status 429 with code RATE_LIMITED', async () => {
    const response = rateLimited();
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error.code).toBe('RATE_LIMITED');
    expect(body.error.message).toBe('Too many requests');
  });

  it('internalError returns status 500 with code INTERNAL_ERROR', async () => {
    const response = internalError();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Internal server error');
  });

  it('badGateway returns status 502 with code BAD_GATEWAY', async () => {
    const response = badGateway();
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error.code).toBe('BAD_GATEWAY');
    expect(body.error.message).toBe('External service unavailable');
  });

  it('badRequest accepts details parameter', async () => {
    const details = { field: 'title', reason: 'too long' };
    const response = badRequest('Validation failed', details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });

  it('validationError accepts details parameter', async () => {
    const details = { field: 'email', reason: 'invalid format' };
    const response = validationError('Invalid email', details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });

  it('unauthorized accepts custom message', async () => {
    const response = unauthorized('Token expired');
    const body = await response.json();
    expect(body.error.message).toBe('Token expired');
  });

  it('forbidden accepts custom message', async () => {
    const response = forbidden('Admin only');
    const body = await response.json();
    expect(body.error.message).toBe('Admin only');
  });
});
