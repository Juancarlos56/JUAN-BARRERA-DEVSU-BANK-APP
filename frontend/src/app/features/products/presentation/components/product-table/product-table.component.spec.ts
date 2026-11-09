import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Product } from '../../../domain';
import { buildProduct } from '../../../testing/product.fixtures';
import { ProductTableComponent } from './product-table.component';

describe('ProductTableComponent', () => {
  let fixture: ComponentFixture<ProductTableComponent>;
  let element: HTMLElement;

  const render = (inputs: {
    products?: Product[];
    loading?: boolean;
    error?: string | null;
    skeletonRows?: number;
    emptyMessage?: string;
  }) => {
    fixture.componentRef.setInput('products', inputs.products ?? []);
    Object.entries(inputs)
      .filter(([key]) => key !== 'products')
      .forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  };
  const bodyRows = () => Array.from(element.querySelectorAll('tbody tr'));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTableComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('muestra los encabezados del diseño D1', () => {
    render({});

    const headers = Array.from(element.querySelectorAll('.table__label')).map((label) =>
      label.textContent!.trim(),
    );
    expect(headers).toEqual([
      'Logo',
      'Nombre del producto',
      'Descripción',
      'Fecha de liberación',
      'Fecha de reestructuración',
    ]);
    expect(element.querySelectorAll('.table__hint')).toHaveLength(3);
  });

  it('muestra una fila por producto con fechas en formato dd/MM/yyyy', () => {
    render({
      products: [buildProduct(), buildProduct({ id: 'otro', name: 'Cuenta Ahorro' })],
    });

    expect(bodyRows()).toHaveLength(2);
    const cells = Array.from(bodyRows()[0].querySelectorAll('td')).map((td) =>
      td.textContent!.trim(),
    );
    expect(cells.slice(1, 5)).toEqual([
      'Tarjetas de Crédito',
      'Tarjeta de consumo bajo la modalidad de crédito',
      '01/02/2025',
      '01/02/2026',
    ]);
  });

  it('muestra filas skeleton mientras carga', () => {
    render({ loading: true, skeletonRows: 3, products: [buildProduct()] });

    expect(element.querySelectorAll('[data-testid="skeleton-row"]')).toHaveLength(3);
    expect(element.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    expect(element.textContent).not.toContain('Tarjetas de Crédito');
  });

  it('muestra el mensaje vacío cuando no hay productos', () => {
    render({ emptyMessage: 'No se encontraron productos.' });

    expect(element.textContent).toContain('No se encontraron productos.');
  });

  it('muestra un menú de acciones por producto con la opción Editar (D3)', () => {
    render({ products: [buildProduct(), buildProduct({ id: 'otro', name: 'Cuenta Ahorro' })] });

    const menus = element.querySelectorAll('tbody app-dropdown-menu');
    expect(menus).toHaveLength(2);
    expect(menus[1].querySelector('button')!.getAttribute('aria-label')).toBe(
      'Acciones de Cuenta Ahorro',
    );
  });

  it('emite edit con el producto al elegir Editar', () => {
    const edited: Product[] = [];
    fixture.componentInstance.edit.subscribe((product) => edited.push(product));
    const product = buildProduct();
    render({ products: [product] });

    element.querySelector<HTMLButtonElement>('.dropdown__trigger')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();

    expect(edited).toEqual([product]);
  });

  it('ofrece la opción Eliminar y emite delete con el producto (F6)', () => {
    const deleted: Product[] = [];
    fixture.componentInstance.delete.subscribe((product) => deleted.push(product));
    const product = buildProduct();
    render({ products: [product] });

    element.querySelector<HTMLButtonElement>('.dropdown__trigger')!.click();
    fixture.detectChanges();
    const options = element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(Array.from(options).map((o) => o.textContent!.trim())).toEqual(['Editar', 'Eliminar']);
    options[1].click();

    expect(deleted).toEqual([product]);
  });

  it('ignora acciones desconocidas', () => {
    const edit = jest.fn();
    const remove = jest.fn();
    fixture.componentInstance.edit.subscribe(edit);
    fixture.componentInstance.delete.subscribe(remove);
    render({ products: [buildProduct()] });

    const menu = fixture.debugElement.query((node) => node.name === 'app-dropdown-menu');
    menu.triggerEventHandler('itemSelected', 'archivar');

    expect(edit).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('el estado vacío ocupa también la columna de acciones', () => {
    render({});

    expect(element.querySelector('.table__state')!.getAttribute('colspan')).toBe('6');
  });

  it('muestra el error y emite reintentar', () => {
    const retry = jest.fn();
    fixture.componentInstance.retry.subscribe(retry);
    render({ error: 'No se pudo conectar con el servidor.' });

    expect(element.querySelector('[role="alert"]')!.textContent).toContain(
      'No se pudo conectar con el servidor.',
    );
    element.querySelector<HTMLButtonElement>('.table__retry')!.click();
    expect(retry).toHaveBeenCalled();
  });
});
