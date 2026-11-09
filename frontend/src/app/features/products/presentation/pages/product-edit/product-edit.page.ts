import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { toErrorMessage } from '@core/errors/error-message';
import { NotificationService } from '@core/notifications/notification.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { GetProductByIdUseCase, UpdateProductUseCase } from '../../../application';
import { Product } from '../../../domain';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

export const PRODUCT_UPDATED_MESSAGE = 'Producto actualizado correctamente.';

/**
 * Página de edición de productos (F5). Carga el producto por id desde la API,
 * así la URL funciona también al recargar o abrirla directamente.
 */
@Component({
  selector: 'app-product-edit-page',
  imports: [ProductFormComponent, RouterLink, SkeletonComponent],
  templateUrl: './product-edit.page.html',
  styleUrls: ['../product-form-page.scss', './product-edit.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPage implements OnInit {
  /** Parámetro `:id` de la ruta (enlazado con `withComponentInputBinding`). */
  readonly id = input.required<string>();

  private readonly getProductById = inject(GetProductByIdUseCase);
  private readonly updateProduct = inject(UpdateProductUseCase);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly skeletonFields = [0, 1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.loadProduct();
  }

  protected loadProduct(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.getProductById
      .execute(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => this.product.set(product),
        error: (error: unknown) => this.loadError.set(toErrorMessage(error)),
      });
  }

  protected onSave(product: Product): void {
    this.submitting.set(true);
    this.updateProduct
      .execute(product)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(PRODUCT_UPDATED_MESSAGE);
          void this.router.navigate(['/products']);
        },
        error: (error: unknown) => this.notifications.error(toErrorMessage(error)),
      });
  }
}
