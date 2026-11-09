export type AppErrorKind =
  'network' | 'validation' | 'conflict' | 'not-found' | 'server' | 'unknown';

/**
 * Error normalizado de la aplicación. Las capas superiores trabajan con este
 * tipo y no con `HttpErrorResponse`, así no dependen del detalle HTTP.
 */
export class AppError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
