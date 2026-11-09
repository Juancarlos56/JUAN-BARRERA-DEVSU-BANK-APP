import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductRepository } from '../../domain';
import { normalizeProduct } from './normalize-product';

@Injectable({ providedIn: 'root' })
export class CreateProductUseCase {
  private readonly repository = inject(ProductRepository);

  execute(product: Product): Observable<Product> {
    return this.repository.create(normalizeProduct(product));
  }
}
