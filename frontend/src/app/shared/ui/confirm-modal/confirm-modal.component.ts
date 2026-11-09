import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

/**
 * Modal de confirmación (D4). Componente de presentación: no decide qué se confirma,
 * solo muestra el mensaje y emite `confirmed` o `cancelled`.
 * Al abrirse enfoca "Cancelar" (la opción segura) y se cierra con Escape o clic fuera.
 */
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ConfirmModalComponent {
  readonly open = input(false);
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly busyLabel = input('Procesando...');
  /** Mientras es `true` los botones se deshabilitan y no se puede cerrar el modal. */
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    effect(() => this.cancelButton()?.nativeElement.focus());
  }

  protected onCancel(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  protected onConfirm(): void {
    if (!this.busy()) {
      this.confirmed.emit();
    }
  }

  protected onEscape(): void {
    if (this.open()) {
      this.onCancel();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
