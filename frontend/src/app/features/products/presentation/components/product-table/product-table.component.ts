import {
  ChangeDetectionStrategy,
  Component,
  OutputEmitterRef,
  computed,
  input,
  output,
} from '@angular/core';

import { IsoDatePipe } from '@shared/pipes/iso-date.pipe';
import { AvatarComponent } from '@shared/ui/avatar/avatar.component';
import {
  DropdownMenuComponent,
  DropdownMenuItem,
} from '@shared/ui/dropdown-menu/dropdown-menu.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { Product } from '../../../domain';

interface ColumnHeader {
  readonly label: string;
  readonly hint?: string;
}

/** Tabla de productos (D1). Componente de presentación: solo recibe datos y emite eventos. */
@Component({
  selector: 'app-product-table',
  imports: [AvatarComponent, DropdownMenuComponent, SkeletonComponent, IsoDatePipe],
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
  readonly edit = output<Product>();
  readonly delete = output<Product>();

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
  /** Columnas de datos + columna de acciones (D3). */
  protected readonly totalColumns = this.columns.length + 1;
  protected readonly rowActions: readonly DropdownMenuItem[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar', variant: 'danger' },
  ];
  protected readonly skeletonRowIndexes = computed(() =>
    Array.from({ length: this.skeletonRows() }, (_, index) => index),
  );

  /** Relaciona cada opción del menú con el evento que emite (agregar una acción no toca la lógica). */
  private readonly actionOutputs: Readonly<Record<string, OutputEmitterRef<Product>>> = {
    edit: this.edit,
    delete: this.delete,
  };

  protected onRowAction(action: string, product: Product): void {
    this.actionOutputs[action]?.emit(product);
  }
}
