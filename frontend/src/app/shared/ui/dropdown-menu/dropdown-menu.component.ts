import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface DropdownMenuItem {
  readonly id: string;
  readonly label: string;
  readonly variant?: 'default' | 'danger';
}

interface MenuPosition {
  readonly top: number;
  readonly right: number;
}

const MENU_OFFSET_PX = 4;

/**
 * Menú contextual (D3). Se posiciona con `position: fixed` respecto al botón para que
 * no lo recorte el scroll horizontal de la tabla. Se cierra al hacer clic fuera,
 * con Escape o al desplazar/redimensionar la ventana.
 */
@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
    '(window:resize)': 'close()',
    '(window:scroll)': 'close()',
  },
})
export class DropdownMenuComponent {
  readonly items = input.required<readonly DropdownMenuItem[]>();
  readonly label = input('Acciones');
  readonly itemSelected = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly isOpen = signal(false);
  protected readonly position = signal<MenuPosition>({ top: 0, right: 0 });

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    this.position.set({
      top: rect.bottom + MENU_OFFSET_PX,
      right: window.innerWidth - rect.right,
    });
    this.isOpen.set(true);
  }

  protected select(item: DropdownMenuItem): void {
    this.close();
    this.itemSelected.emit(item.id);
  }

  close(): void {
    this.isOpen.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  protected onEscape(): void {
    if (this.isOpen()) {
      this.close();
      this.trigger().nativeElement.focus();
    }
  }
}
