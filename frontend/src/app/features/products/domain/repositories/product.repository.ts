import { Observable } from 'rxjs';

import { Product } from '../models/product.model';

/**
 * Puerto (contrato) de acceso a productos.
 * La capa de aplicación depende de esta abstracción y no de su implementación
 * (principio de inversión de dependencias). La implementación concreta vive
 * en la capa de infraestructura.
 */
export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract getById(id: string): Observable<Product>;
  abstract create(product: Product): Observable<Product>;
  abstract update(product: Product): Observable<Product>;
  abstract delete(id: string): Observable<void>;
  abstract existsById(id: string): Observable<boolean>;
}
