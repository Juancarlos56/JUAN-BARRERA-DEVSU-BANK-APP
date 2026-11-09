import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { AppError } from '@core/errors/app-error';
import { NotificationService } from '@core/notifications/notification.service';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { GetProductsUseCase } from '../../../application/use-cases/get-products.use-case';
import { Product } from '../../../domain';
import { buildProduct } from '../../../testing/product.fixtures';
import { PRODUCT_DELETED_MESSAGE, ProductListPage, SEARCH_DEBOUNCE_MS } from './product-list.page';

const buildProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) =>
    buildProduct({ id: `id-${index + 1}`, name: `Producto ${index + 1}` }),
  );

describe('ProductListPage', () => {
  let fixture: ComponentFixture<ProductListPage>;
  let element: HTMLElement;
  let getProducts: { execute: jest.Mock };
  let deleteProduct: { execute: jest.Mock };
  let notifications: { success: jest.Mock; error: jest.Mock };

  const setup = (response = of(buildProducts(12))) => {
    getProducts = { execute: jest.fn().mockReturnValue(response) };
    deleteProduct = { execute: jest.fn() };
    notifications = { success: jest.fn(), error: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        provideRouter([]),
        { provide: GetProductsUseCase, useValue: getProducts },
        { provide: DeleteProductUseCase, useValue: deleteProduct },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    fixture = TestBed.createComponent(ProductListPage);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  };

  const rows = () => element.querySelectorAll('app-product-table tbody tr');
  const count = () => element.querySelector('.product-list__count')!.textContent!.trim();
  const search = (value: string) => {
    const input = element.querySelector<HTMLInputElement>('#product-search')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    fixture.detectChanges();
  };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('carga los productos al iniciar y muestra 5 por defecto', () => {
    setup();

    expect(getProducts.execute).toHaveBeenCalledTimes(1);
    expect(rows()).toHaveLength(5);
    expect(count()).toBe('12 Resultados');
  });

  it('muestra el botón Agregar que navega al formulario de registro', () => {
    setup();

    const add = element.querySelector<HTMLAnchorElement>('.product-list__add')!;
    expect(add.textContent!.trim()).toBe('Agregar');
    expect(add.getAttribute('href')).toBe('/new');
  });

  it('navega a la edición al elegir Editar en el menú de un producto (F5)', () => {
    setup();
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    element.querySelector<HTMLButtonElement>('.dropdown__trigger')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();

    expect(navigate).toHaveBeenCalledWith(['/products', 'id-1', 'edit']);
  });

  it('ofrece 5, 10 y 20 registros y cambia la cantidad mostrada', () => {
    setup();
    const select = element.querySelector<HTMLSelectElement>('#page-size')!;

    expect(Array.from(select.options).map((option) => option.value)).toEqual(['5', '10', '20']);

    select.value = '10';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(rows()).toHaveLength(10);
  });

  it('ignora valores de tamaño de página no permitidos', () => {
    setup();
    const select = element.querySelector<HTMLSelectElement>('#page-size')!;
    const option = document.createElement('option');
    option.value = '15';
    select.appendChild(option);

    select.value = '15';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(rows()).toHaveLength(5);
  });

  it('filtra al escribir en el buscador después del debounce', () => {
    setup();
    const input = element.querySelector<HTMLInputElement>('#product-search')!;

    input.value = 'Producto 12';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(count()).toBe('12 Resultados');

    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    fixture.detectChanges();
    expect(count()).toBe('1 Resultados');
  });

  it('muestra un mensaje cuando la búsqueda no tiene resultados', () => {
    setup();

    search('hipoteca');

    expect(element.textContent).toContain('No se encontraron productos para "hipoteca".');
  });

  it('navega entre páginas con el paginador', () => {
    setup();

    element.querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Página 2 de 3');
    expect(rows()[0].textContent).toContain('Producto 6');
  });

  it('oculta el paginador cuando hay una sola página', () => {
    setup(of(buildProducts(3)));

    expect(element.querySelector('app-paginator')).toBeNull();
    expect(count()).toBe('3 Resultados');
  });

  it('muestra el mensaje de listado vacío cuando no hay productos', () => {
    setup(of([]));

    expect(element.textContent).toContain('No hay productos registrados.');
  });

  it('muestra el error y permite reintentar la carga', () => {
    setup(throwError(() => new AppError('network', 'No se pudo conectar con el servidor.')));

    expect(element.querySelector('[role="alert"]')!.textContent).toContain(
      'No se pudo conectar con el servidor.',
    );

    getProducts.execute.mockReturnValue(of(buildProducts(2)));
    element.querySelector<HTMLButtonElement>('.table__retry')!.click();
    fixture.detectChanges();

    expect(rows()).toHaveLength(2);
  });

  describe('eliminar producto (F6)', () => {
    const modal = () => element.querySelector<HTMLElement>('[role="alertdialog"]');
    const modalButton = (label: string) =>
      Array.from(modal()!.querySelectorAll('button')).find(
        (button) => button.textContent!.trim() === label,
      )!;
    const requestDeleteOfFirstRow = () => {
      element.querySelector<HTMLButtonElement>('.dropdown__trigger')!.click();
      fixture.detectChanges();
      element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[1].click();
      fixture.detectChanges();
    };

    it('abre el modal con el nombre del producto y los botones Cancelar y Eliminar', () => {
      setup();

      requestDeleteOfFirstRow();

      expect(modal()!.textContent).toContain('¿Estás seguro de eliminar el producto Producto 1?');
      expect(modalButton('Cancelar')).toBeDefined();
      expect(modalButton('Eliminar')).toBeDefined();
    });

    it('Cancelar solo oculta el modal', () => {
      setup();
      requestDeleteOfFirstRow();

      modalButton('Cancelar').click();
      fixture.detectChanges();

      expect(modal()).toBeNull();
      expect(deleteProduct.execute).not.toHaveBeenCalled();
      expect(count()).toBe('12 Resultados');
    });

    it('Eliminar borra el producto, notifica y cierra el modal', () => {
      setup();
      deleteProduct.execute.mockReturnValue(of(undefined));
      requestDeleteOfFirstRow();

      modalButton('Eliminar').click();
      fixture.detectChanges();

      expect(deleteProduct.execute).toHaveBeenCalledWith('id-1');
      expect(notifications.success).toHaveBeenCalledWith(PRODUCT_DELETED_MESSAGE);
      expect(modal()).toBeNull();
      expect(count()).toBe('11 Resultados');
      expect(rows()[0].textContent).toContain('Producto 2');
    });

    it('muestra "Eliminando..." y bloquea el modal mientras espera la respuesta', () => {
      setup();
      const response = new Subject<void>();
      deleteProduct.execute.mockReturnValue(response);
      requestDeleteOfFirstRow();

      modalButton('Eliminar').click();
      fixture.detectChanges();

      expect(modalButton('Eliminando...').disabled).toBe(true);
      expect(modalButton('Cancelar').disabled).toBe(true);

      response.next();
      response.complete();
      fixture.detectChanges();
      expect(modal()).toBeNull();
    });

    it('muestra el error, cierra el modal y conserva el producto si falla', () => {
      setup();
      deleteProduct.execute.mockReturnValue(
        throwError(() => new AppError('server', 'Ocurrió un error en el servidor.')),
      );
      requestDeleteOfFirstRow();

      modalButton('Eliminar').click();
      fixture.detectChanges();

      expect(notifications.error).toHaveBeenCalledWith('Ocurrió un error en el servidor.');
      expect(modal()).toBeNull();
      expect(count()).toBe('12 Resultados');
      expect(getProducts.execute).toHaveBeenCalledTimes(1);
    });

    it('recarga el listado si el producto ya no existía', () => {
      setup();
      deleteProduct.execute.mockReturnValue(
        throwError(() => new AppError('not-found', 'El producto no existe o ya fue eliminado.')),
      );
      requestDeleteOfFirstRow();

      modalButton('Eliminar').click();
      fixture.detectChanges();

      expect(notifications.error).toHaveBeenCalledWith('El producto no existe o ya fue eliminado.');
      expect(getProducts.execute).toHaveBeenCalledTimes(2);
    });

    it('ignora la confirmación si no hay producto seleccionado', () => {
      setup();
      const page = fixture.componentInstance as unknown as { onConfirmDelete(): void };

      page.onConfirmDelete();

      expect(deleteProduct.execute).not.toHaveBeenCalled();
    });
  });
});
