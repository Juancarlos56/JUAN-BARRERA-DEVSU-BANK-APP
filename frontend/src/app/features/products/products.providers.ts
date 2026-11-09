import { Provider } from '@angular/core';

import { ProductRepository } from './domain';
import { HttpProductRepository } from './infrastructure/repositories/http-product.repository';

/**
 * Composición de dependencias del módulo de productos:
 * enlaza el puerto del dominio con su adaptador HTTP.
 */
export const provideProducts = (): Provider[] => [
  { provide: ProductRepository, useClass: HttpProductRepository },
];
