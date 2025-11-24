/**
 * @jest-environment node
 */
import { APIError, handleAPIError } from '@/lib/api/errorHandler';

describe('APIError', () => {
  it('should create an APIError with correct properties', () => {
    const error = new APIError('Invalid request', 400, 'INVALID_REQUEST');

    expect(error.message).toBe('Invalid request');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INVALID_REQUEST');
  });

  it('should include parsed Zod errors if provided', () => {
    const zodErrors = [{ path: ['email'], message: 'Invalid email' }];

    const error = new APIError('Validation failed', 400, 'VALIDATION_ERROR', zodErrors as any);

    expect(error.parsedError).toEqual(zodErrors);
  });
});

describe('handleAPIError', () => {
  it('should return correct response for APIError', async () => {
    const error = new APIError('Invalid request', 400, 'INVALID_REQUEST');
    const response = handleAPIError(error);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid request');
    expect(body.code).toBe('INVALID_REQUEST');
  });

  it('should include requestId in response if provided', async () => {
    const error = new APIError('Invalid request', 400, 'INVALID_REQUEST');
    const response = handleAPIError(error, 'req-123');

    const body = await response.json();
    expect(body.requestId).toBe('req-123');
  });

  it('should include validation errors for Zod failures', async () => {
    const zodErrors = [{ path: ['email'], message: 'Invalid email' }];
    const error = new APIError('Validation failed', 400, 'VALIDATION_ERROR', zodErrors as any);
    const response = handleAPIError(error);

    const body = await response.json();
    expect(body.validationErrors).toEqual(zodErrors);
  });

  it('should return 500 for unexpected errors', async () => {
    const error = new Error('Something went wrong');
    const response = handleAPIError(error);

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe('Internal server error');
    expect(body.code).toBe('INTERNAL_ERROR');
  });

  it('should hide error details in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';

    const error = new Error('Database connection failed');
    const response = handleAPIError(error);

    const body = await response.json();
    expect(body.details).toBeUndefined();

    (process.env as any).NODE_ENV = originalEnv;
  });

  it('should show error details in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'development';

    const error = new Error('Database connection failed');
    const response = handleAPIError(error);

    const body = await response.json();
    expect(body.details).toBe('Database connection failed');

    (process.env as any).NODE_ENV = originalEnv;
  });
});
