import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { AppError } from '@core/errors/app-error';
import { Product } from '../../domain';
import { buildProduct } from '../../testing/product.fixtures';
import { GetProductsUseCase } from '../use-cases/get-products.use-case';
import { ProductListStore, isPageSize } from './product-list.store';

const buildProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) =>
    buildProduct({ id: `id-${index + 1}`, name: `Producto ${index + 1}` }),
  );

describe('ProductListStore', () => {
  let store: ProductListStore;
  let getProducts: { execute: jest.Mock };

  beforeEach(() => {
    getProducts = { execute: jest.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: GetProductsUseCase, useValue: getProducts }],
    });
    store = TestBed.inject(ProductListStore);
  });

  const loadWith = (products: Product[]) => {
    getProducts.execute.mockReturnValue(of(products));
    store.load();
  };

  it('inicia sin productos, en la página 1 y con 5 registros por página', () => {
    expect(store.visibleProducts()).toEqual([]);
    expect(store.totalResults()).toBe(0);
    expect(store.page()).toBe(1);
    expect(store.totalPages()).toBe(1);
    expect(store.pageSize()).toBe(5);
    expect(store.isLoading()).toBe(false);
  });

  it('marca el estado de carga mientras espera la respuesta', () => {
    const response = new Subject<Product[]>();
    getProducts.execute.mockReturnValue(response);

    store.load();
    expect(store.isLoading()).toBe(true);

    response.next(buildProducts(2));
    expect(store.isLoading()).toBe(false);
    expect(store.totalResults()).toBe(2);
  });

  it('guarda el mensaje de error si la carga falla', () => {
    getProducts.execute.mockReturnValue(throwError(() => new AppError('network', 'Sin conexión')));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Sin conexión');
  });

  it('limpia el error al volver a cargar', () => {
    getProducts.execute.mockReturnValue(throwError(() => new AppError('network', 'Sin conexión')));
    store.load();

    loadWith(buildProducts(1));

    expect(store.error()).toBeNull();
  });

  it('cancela la petición anterior si se vuelve a cargar', () => {
    const first = new Subject<Product[]>();
    getProducts.execute.mockReturnValueOnce(first).mockReturnValueOnce(of(buildProducts(1)));

    store.load();
    store.load();
    first.next(buildProducts(7));

    expect(store.totalResults()).toBe(1);
  });

  it('pagina según el tamaño de página', () => {
    loadWith(buildProducts(12));

    expect(store.visibleProducts().map((p) => p.id)).toEqual([
      'id-1',
      'id-2',
      'id-3',
      'id-4',
      'id-5',
    ]);
    expect(store.totalPages()).toBe(3);

    store.goToPage(3);
    expect(store.visibleProducts().map((p) => p.id)).toEqual(['id-11', 'id-12']);
  });

  it('acota la navegación a páginas válidas', () => {
    loadWith(buildProducts(12));

    store.goToPage(99);
    expect(store.page()).toBe(3);

    store.goToPage(-4);
    expect(store.page()).toBe(1);
  });

  it('al cambiar el tamaño de página vuelve a la primera página', () => {
    loadWith(buildProducts(25));
    store.goToPage(3);

    store.setPageSize(20);

    expect(store.page()).toBe(1);
    expect(store.visibleProducts()).toHaveLength(20);
    expect(store.totalPages()).toBe(2);
  });

  it('filtra por el término de búsqueda y vuelve a la primera página', () => {
    loadWith([...buildProducts(10), buildProduct({ id: 'esp', name: 'Crédito Especial' })]);
    store.goToPage(2);

    store.setSearchTerm('ESPECIAL');

    expect(store.page()).toBe(1);
    expect(store.totalResults()).toBe(1);
    expect(store.visibleProducts()[0].id).toBe('esp');
  });

  it('acota la página si los resultados disminuyen', () => {
    const response = new Subject<Product[]>();
    getProducts.execute.mockReturnValue(response);
    store.load();
    response.next(buildProducts(12));
    store.goToPage(3);

    store.load();
    response.next(buildProducts(4));

    expect(store.page()).toBe(1);
  });
});

describe('isPageSize', () => {
  it('acepta solo 5, 10 y 20', () => {
    expect([5, 10, 20].every(isPageSize)).toBe(true);
    expect(isPageSize(15)).toBe(false);
  });
});
