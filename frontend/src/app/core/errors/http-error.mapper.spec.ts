import { HttpErrorResponse } from '@angular/common/http';

import { AppError, isAppError } from './app-error';
import { ERROR_MESSAGES, mapHttpError } from './http-error.mapper';

const httpError = (status: number, error: unknown = null) =>
  new HttpErrorResponse({ status, error });

describe('mapHttpError', () => {
  it.each([
    [0, null, 'network', ERROR_MESSAGES.network],
    [400, { message: 'Invalid body' }, 'validation', ERROR_MESSAGES.validation],
    [
      400,
      { message: 'Duplicate identifier found in the database' },
      'conflict',
      ERROR_MESSAGES.conflict,
    ],
    [400, 'texto plano', 'validation', ERROR_MESSAGES.validation],
    [400, { message: 123 }, 'validation', ERROR_MESSAGES.validation],
    [404, null, 'not-found', ERROR_MESSAGES.notFound],
    [500, null, 'server', ERROR_MESSAGES.server],
    [503, null, 'server', ERROR_MESSAGES.server],
    [418, null, 'unknown', ERROR_MESSAGES.unknown],
  ])('status %s con body %j se traduce a "%s"', (status, body, kind, message) => {
    const result = mapHttpError(httpError(status, body));

    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe(kind);
    expect(result.message).toBe(message);
    expect(result.status).toBe(status);
  });
});

describe('isAppError', () => {
  it('identifica instancias de AppError', () => {
    expect(isAppError(new AppError('unknown', 'x'))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
  });
});
