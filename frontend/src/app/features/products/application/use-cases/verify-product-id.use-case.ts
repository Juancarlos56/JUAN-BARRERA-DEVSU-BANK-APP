import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain';

/** Indica si un id ya está registrado (true = existe, por lo tanto no disponible). */
@Injectable({ providedIn: 'root' })
export class VerifyProductIdUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string): Observable<boolean> {
    return this.repository.existsById(id.trim());
  }
}
