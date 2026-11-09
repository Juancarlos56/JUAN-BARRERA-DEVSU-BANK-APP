import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductRepository } from '../../domain';

@Injectable({ providedIn: 'root' })
export class GetProductsUseCase {
  private readonly repository = inject(ProductRepository);

  execute(): Observable<Product[]> {
    return this.repository.getAll();
  }
}
