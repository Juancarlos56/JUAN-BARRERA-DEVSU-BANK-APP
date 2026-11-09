import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { toErrorMessage } from '@core/errors/error-message';
import { NotificationService } from '@core/notifications/notification.service';
import { CreateProductUseCase } from '../../../application';
import { Product } from '../../../domain';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

export const PRODUCT_CREATED_MESSAGE = 'Producto agregado correctamente.';

/** Página de registro de productos (F4). */
@Component({
  selector: 'app-product-create-page',
  imports: [ProductFormComponent, RouterLink],
  templateUrl: './product-create.page.html',
  styleUrl: '../product-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePage {
  private readonly createProduct = inject(CreateProductUseCase);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected onSave(product: Product): void {
    this.submitting.set(true);
    this.createProduct
      .execute(product)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(PRODUCT_CREATED_MESSAGE);
          void this.router.navigate(['/products']);
        },
        error: (error: unknown) => this.notifications.error(toErrorMessage(error)),
      });
  }
}
