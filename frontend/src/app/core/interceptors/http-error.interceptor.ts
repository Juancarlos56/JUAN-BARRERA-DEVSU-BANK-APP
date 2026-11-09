import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { mapHttpError } from '../errors/http-error.mapper';

/**
 * Normaliza todos los errores HTTP a `AppError`.
 * Solo transforma el error: decidir cómo mostrarlo es responsabilidad de quien consume.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? mapHttpError(error) : error)),
    ),
  );
