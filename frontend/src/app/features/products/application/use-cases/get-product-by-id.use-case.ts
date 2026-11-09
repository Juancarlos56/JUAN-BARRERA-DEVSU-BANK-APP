import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product, ProductRepository } from '../../domain';

@Injectable({ providedIn: 'root' })
export class GetProductByIdUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string): Observable<Product> {
    return this.repository.getById(id.trim());
  }
}
