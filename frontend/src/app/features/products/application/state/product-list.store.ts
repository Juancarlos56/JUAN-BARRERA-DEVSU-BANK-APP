import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';

import { toErrorMessage } from '@core/errors/error-message';
import { Product } from '../../domain';
import { DeleteProductUseCase } from '../use-cases/delete-product.use-case';
import { GetProductsUseCase } from '../use-cases/get-products.use-case';
import { filterProducts } from './product-filter';

/** Cantidades de registros permitidas en el listado (F3). */
export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProductListState {
  readonly products: readonly Product[];
  readonly status: LoadStatus;
  readonly error: string | null;
  readonly searchTerm: string;
  readonly pageSize: PageSize;
  readonly page: number;
}

const INITIAL_STATE: ProductListState = {
  products: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  pageSize: PAGE_SIZE_OPTIONS[0],
  page: 1,
};

/**
 * Estado del listado de productos basado en signals.
 * Toda la derivación (filtro, conteo, paginación) se hace con `computed`,
 * que memoriza el resultado y solo recalcula cuando cambia su dependencia.
 */
@Injectable({ providedIn: 'root' })
export class ProductListStore {
  private readonly getProducts = inject(GetProductsUseCase);
  private readonly deleteProduct = inject(DeleteProductUseCase);
  private readonly state = signal<ProductListState>(INITIAL_STATE);
  private loadSubscription?: Subscription;

  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().error);
  readonly searchTerm = computed(() => this.state().searchTerm);
  readonly pageSize = computed(() => this.state().pageSize);

  readonly filteredProducts = computed(() =>
    filterProducts(this.state().products, this.state().searchTerm),
  );
  readonly totalResults = computed(() => this.filteredProducts().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalResults() / this.pageSize())),
  );
  /** Página actual acotada al rango válido (p. ej. tras filtrar o eliminar). */
  readonly page = computed(() => Math.min(this.state().page, this.totalPages()));
  readonly visibleProducts = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  /**
   * Elimina el producto en la API y, si tiene éxito, lo quita del estado local
   * sin volver a pedir todo el listado. Devuelve el observable para que la vista
   * decida cómo informar el resultado.
   */
  remove(id: string): Observable<void> {
    return this.deleteProduct
      .execute(id)
      .pipe(
        tap(() =>
          this.patch({ products: this.state().products.filter((product) => product.id !== id) }),
        ),
      );
  }

  load(): void {
    this.loadSubscription?.unsubscribe();
    this.patch({ status: 'loading', error: null });

    this.loadSubscription = this.getProducts.execute().subscribe({
      next: (products) => this.patch({ products, status: 'success' }),
      error: (error: unknown) => this.patch({ status: 'error', error: toErrorMessage(error) }),
    });
  }

  setSearchTerm(searchTerm: string): void {
    this.patch({ searchTerm, page: 1 });
  }

  setPageSize(pageSize: PageSize): void {
    this.patch({ pageSize, page: 1 });
  }

  goToPage(page: number): void {
    this.patch({ page: Math.min(Math.max(1, page), this.totalPages()) });
  }

  private patch(changes: Partial<ProductListState>): void {
    this.state.update((current) => ({ ...current, ...changes }));
  }
}

export const isPageSize = (value: number): value is PageSize =>
  (PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
