import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownMenuComponent, DropdownMenuItem } from './dropdown-menu.component';

describe('DropdownMenuComponent', () => {
  const items: DropdownMenuItem[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar', variant: 'danger' },
  ];
  let fixture: ComponentFixture<DropdownMenuComponent>;
  let element: HTMLElement;
  let selected: string[];

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownMenuComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('label', 'Acciones de Tarjeta');
    element = fixture.nativeElement as HTMLElement;
    selected = [];
    fixture.componentInstance.itemSelected.subscribe((id) => selected.push(id));
    document.body.appendChild(element);
    fixture.detectChanges();
  });

  afterEach(() => element.remove());

  const trigger = () => element.querySelector<HTMLButtonElement>('.dropdown__trigger')!;
  const menu = () => element.querySelector<HTMLElement>('[role="menu"]');
  const open = () => {
    trigger().click();
    fixture.detectChanges();
  };

  it('inicia cerrado con un botón accesible', () => {
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-label')).toBe('Acciones de Tarjeta');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('abre el menú debajo del botón con sus opciones', () => {
    jest.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      right: 900,
    } as DOMRect);
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });

    open();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(
      Array.from(menu()!.querySelectorAll('[role="menuitem"]')).map((b) => b.textContent!.trim()),
    ).toEqual(['Editar', 'Eliminar']);
    expect(menu()!.style.top).toBe('104px');
    expect(menu()!.style.right).toBe('100px');
    expect(element.querySelector('.dropdown__item--danger')!.textContent).toContain('Eliminar');
  });

  it('emite la opción elegida y se cierra', () => {
    open();

    element.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();
    fixture.detectChanges();

    expect(selected).toEqual(['edit']);
    expect(menu()).toBeNull();
  });

  it('se cierra al volver a presionar el botón', () => {
    open();
    open();

    expect(menu()).toBeNull();
  });

  it('se cierra al hacer clic fuera, pero no al hacer clic dentro', () => {
    open();

    menu()!.click();
    fixture.detectChanges();
    expect(menu()).not.toBeNull();

    document.body.click();
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });

  it('se cierra con Escape y devuelve el foco al botón', () => {
    open();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('Escape no hace nada si el menú está cerrado', () => {
    const focus = jest.spyOn(trigger(), 'focus');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(focus).not.toHaveBeenCalled();
  });

  it('se cierra al desplazar la ventana', () => {
    open();

    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(menu()).toBeNull();
  });
});
