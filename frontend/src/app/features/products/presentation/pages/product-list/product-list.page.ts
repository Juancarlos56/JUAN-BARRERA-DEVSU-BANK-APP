import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { isAppError } from '@core/errors/app-error';
import { toErrorMessage } from '@core/errors/error-message';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmModalComponent } from '@shared/ui/confirm-modal/confirm-modal.component';
import { PaginatorComponent } from '@shared/ui/paginator/paginator.component';
import {
  PAGE_SIZE_OPTIONS,
  ProductListStore,
  isPageSize,
} from '../../../application/state/product-list.store';
import { Product } from '../../../domain';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

export const SEARCH_DEBOUNCE_MS = 300;
export const PRODUCT_DELETED_MESSAGE = 'Producto eliminado correctamente.';

/** Página contenedora del listado (F1, F2, F3, F5, F6): conecta el store con la vista. */
@Component({
  selector: 'app-product-list-page',
  imports: [ProductTableComponent, PaginatorComponent, ConfirmModalComponent, RouterLink],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  protected readonly store = inject(ProductListStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly emptyMessage = computed(() =>
    this.store.searchTerm()
      ? `No se encontraron productos para "${this.store.searchTerm()}".`
      : 'No hay productos registrados.',
  );

  /** Producto pendiente de confirmar su eliminación (abre el modal D4). */
  protected readonly productToDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteMessage = computed(
    () => `¿Estás seguro de eliminar el producto ${this.productToDelete()?.name ?? ''}?`,
  );

  private readonly searchTerms = new Subject<string>();

  constructor() {
    this.searchTerms
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.store.setSearchTerm(term));
  }

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearch(term: string): void {
    this.searchTerms.next(term);
  }

  protected onPageSizeChange(value: string): void {
    const pageSize = Number(value);
    if (isPageSize(pageSize)) {
      this.store.setPageSize(pageSize);
    }
  }

  protected onEdit(product: Product): void {
    void this.router.navigate(['/products', product.id, 'edit']);
  }

  protected onDeleteRequest(product: Product): void {
    this.productToDelete.set(product);
  }

  protected onCancelDelete(): void {
    this.productToDelete.set(null);
  }

  protected onConfirmDelete(): void {
    const product = this.productToDelete();
    if (!product) {
      return;
    }
    this.deleting.set(true);
    this.store
      .remove(product.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.productToDelete.set(null);
        }),
      )
      .subscribe({
        next: () => this.notifications.success(PRODUCT_DELETED_MESSAGE),
        error: (error: unknown) => {
          this.notifications.error(toErrorMessage(error));
          // Si ya no existía, se recarga para que el listado refleje el estado real.
          if (isAppError(error) && error.kind === 'not-found') {
            this.store.load();
          }
        },
      });
  }
}
