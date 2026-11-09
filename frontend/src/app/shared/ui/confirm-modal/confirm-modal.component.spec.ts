import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let element: HTMLElement;
  let confirmed: number;
  let cancelled: number;

  const render = (inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('message', '¿Estás seguro de eliminar el producto Tarjeta?');
    Object.entries({ open: true, ...inputs }).forEach(([key, value]) =>
      fixture.componentRef.setInput(key, value),
    );
    fixture.detectChanges();
  };
  const dialog = () => element.querySelector<HTMLElement>('[role="alertdialog"]');
  const buttons = () => Array.from(element.querySelectorAll<HTMLButtonElement>('.modal button'));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModalComponent);
    element = fixture.nativeElement as HTMLElement;
    document.body.appendChild(element);
    confirmed = 0;
    cancelled = 0;
    fixture.componentInstance.confirmed.subscribe(() => confirmed++);
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
  });

  afterEach(() => element.remove());

  it('no se muestra cuando está cerrado', () => {
    render({ open: false });

    expect(dialog()).toBeNull();
  });

  it('muestra el mensaje y los botones Cancelar y Confirmar (D4)', () => {
    render();

    expect(dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(dialog()!.textContent).toContain('¿Estás seguro de eliminar el producto Tarjeta?');
    expect(buttons().map((b) => b.textContent!.trim())).toEqual(['Cancelar', 'Confirmar']);
  });

  it('permite personalizar el texto del botón de confirmación', () => {
    render({ confirmLabel: 'Eliminar' });

    expect(buttons()[1].textContent!.trim()).toBe('Eliminar');
  });

  it('enfoca el botón Cancelar al abrirse', () => {
    render();

    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('emite confirmed y cancelled desde sus botones', () => {
    render();

    buttons()[1].click();
    buttons()[0].click();

    expect(confirmed).toBe(1);
    expect(cancelled).toBe(1);
  });

  it('cancela con Escape solo si está abierto', () => {
    render({ open: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancelled).toBe(0);

    render({ open: true });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancelled).toBe(1);
  });

  it('cancela al hacer clic en el fondo, pero no dentro del modal', () => {
    render();

    dialog()!.click();
    expect(cancelled).toBe(0);

    element.querySelector<HTMLElement>('.modal__backdrop')!.click();
    expect(cancelled).toBe(1);
  });

  it('mientras está ocupado deshabilita los botones e ignora cierres', () => {
    render({ busy: true, busyLabel: 'Eliminando...' });

    expect(buttons().every((b) => b.disabled)).toBe(true);
    expect(buttons()[1].textContent!.trim()).toBe('Eliminando...');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    element.querySelector<HTMLElement>('.modal__backdrop')!.click();
    (fixture.componentInstance as unknown as { onConfirm(): void }).onConfirm();

    expect(cancelled).toBe(0);
    expect(confirmed).toBe(0);
  });
});
