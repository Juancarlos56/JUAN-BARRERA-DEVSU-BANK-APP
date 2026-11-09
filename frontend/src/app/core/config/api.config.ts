import { InjectionToken } from '@angular/core';

import { environment } from '@env/environment';

/** URL base de la API. Se inyecta para poder sustituirla en pruebas o por entorno. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});
