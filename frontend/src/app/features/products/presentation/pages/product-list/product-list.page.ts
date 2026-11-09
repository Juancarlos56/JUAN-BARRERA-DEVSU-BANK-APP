import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { PaginatorComponent } from '@shared/ui/paginator/paginator.component';
import {
  PAGE_SIZE_OPTIONS,
  ProductListStore,
  isPageSize,
} from '../../../application/state/product-list.store';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

export const SEARCH_DEBOUNCE_MS = 300;

/** Página contenedora del listado (F1, F2, F3): conecta el store con la vista. */
@Component({
  selector: 'app-product-list-page',
  imports: [ProductTableComponent, PaginatorComponent, RouterLink],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  protected readonly store = inject(ProductListStore);
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly emptyMessage = computed(() =>
    this.store.searchTerm()
      ? `No se encontraron productos para "${this.store.searchTerm()}".`
      : 'No hay productos registrados.',
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
}
