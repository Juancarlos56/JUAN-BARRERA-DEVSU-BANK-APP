import { InjectionToken } from '@angular/core';

/**
 * Fuente de la fecha actual. Inyectarla (en lugar de usar `new Date()` directamente)
 * permite fijar "hoy" en las pruebas y hacerlas deterministas.
 */
export const CLOCK = new InjectionToken<() => Date>('CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
