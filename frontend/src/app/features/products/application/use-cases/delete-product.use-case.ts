import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain';

@Injectable({ providedIn: 'root' })
export class DeleteProductUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
