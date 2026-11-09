import { isAppError } from './app-error';
import { ERROR_MESSAGES } from './http-error.mapper';

/** Obtiene un mensaje presentable para cualquier error capturado. */
export const toErrorMessage = (error: unknown): string =>
  isAppError(error) ? error.message : ERROR_MESSAGES.unknown;
