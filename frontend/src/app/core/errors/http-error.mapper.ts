import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { AppError } from './app-error';

export const ERROR_MESSAGES = {
  network: 'No se pudo conectar con el servidor. Verifica que el servicio esté disponible.',
  validation: 'Los datos enviados no son válidos. Revisa la información e intenta nuevamente.',
  conflict: 'Ya existe un producto con ese ID.',
  notFound: 'El producto no existe o ya fue eliminado.',
  server: 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
  unknown: 'Ocurrió un error inesperado. Intenta nuevamente.',
} as const;

/** Mensaje que devuelve la API cuando se intenta crear un id repetido. */
const DUPLICATE_IDENTIFIER_MESSAGE = 'Duplicate identifier found in the database';

const backendMessageOf = (error: HttpErrorResponse): string | undefined => {
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
};

/** Traduce un error HTTP a un `AppError` con un mensaje entendible para el usuario. */
export const mapHttpError = (error: HttpErrorResponse): AppError => {
  const { status } = error;

  if (status === 0) {
    return new AppError('network', ERROR_MESSAGES.network, status);
  }
  if (status === HttpStatusCode.BadRequest) {
    return backendMessageOf(error) === DUPLICATE_IDENTIFIER_MESSAGE
      ? new AppError('conflict', ERROR_MESSAGES.conflict, status)
      : new AppError('validation', ERROR_MESSAGES.validation, status);
  }
  if (status === HttpStatusCode.NotFound) {
    return new AppError('not-found', ERROR_MESSAGES.notFound, status);
  }
  if (status >= HttpStatusCode.InternalServerError) {
    return new AppError('server', ERROR_MESSAGES.server, status);
  }
  return new AppError('unknown', ERROR_MESSAGES.unknown, status);
};
