import { AppError } from './app-error';
import { toErrorMessage } from './error-message';
import { ERROR_MESSAGES } from './http-error.mapper';

describe('toErrorMessage', () => {
  it('usa el mensaje de un AppError', () => {
    expect(toErrorMessage(new AppError('not-found', 'No existe'))).toBe('No existe');
  });

  it('usa un mensaje genérico para errores desconocidos', () => {
    expect(toErrorMessage(new Error('stack técnico'))).toBe(ERROR_MESSAGES.unknown);
    expect(toErrorMessage('cadena')).toBe(ERROR_MESSAGES.unknown);
  });
});
