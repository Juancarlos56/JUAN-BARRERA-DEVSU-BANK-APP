import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IsoDatePipe } from '@shared/pipes/iso-date.pipe';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { Product } from '../../../domain';

interface ColumnHeader {
  readonly label: string;
  readonly hint?: string;
}

/** Tabla de productos (D1). Componente de presentación: solo recibe datos y emite eventos. */
@Component({
  selector: 'app-product-table',
  imports: [AvatarComponent, SkeletonComponent, IsoDatePipe],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTableComponent {
  readonly products = input.required<readonly Product[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly skeletonRows = input(5);
  readonly emptyMessage = input('No hay productos registrados.');
  readonly retry = output<void>();

  protected readonly columns: readonly ColumnHeader[] = [
    { label: 'Logo' },
    { label: 'Nombre del producto' },
    { label: 'Descripción', hint: 'Detalle del producto financiero' },
    { label: 'Fecha de liberación', hint: 'Fecha en que el producto se libera para los clientes' },
    {
      label: 'Fecha de reestructuración',
      hint: 'Fecha de revisión para cambiar términos y condiciones',
    },
  ];
  protected readonly skeletonRowIndexes = computed(() =>
    Array.from({ length: this.skeletonRows() }, (_, index) => index),
  );
}
