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
    expect(cells.slice(1)).toEqual([
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
