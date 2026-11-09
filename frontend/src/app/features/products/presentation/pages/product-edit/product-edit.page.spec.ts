import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { CLOCK } from '@core/config/clock';
import { AppError } from '@core/errors/app-error';
import { NotificationService } from '@core/notifications/notification.service';
import {
  GetProductByIdUseCase,
  UpdateProductUseCase,
  VerifyProductIdUseCase,
} from '../../../application';
import { Product } from '../../../domain';
import { buildProduct } from '../../../testing/product.fixtures';
import { PRODUCT_UPDATED_MESSAGE, ProductEditPage } from './product-edit.page';

describe('ProductEditPage', () => {
  const product = buildProduct({ dateRelease: '2026-12-01', dateRevision: '2027-12-01' });
  let fixture: ComponentFixture<ProductEditPage>;
  let element: HTMLElement;
  let getProductById: { execute: jest.Mock };
  let updateProduct: { execute: jest.Mock };
  let notifications: { success: jest.Mock; error: jest.Mock };
  let router: Router;

  const setup = (response: ReturnType<jest.Mock> = of(product)) => {
    getProductById = { execute: jest.fn().mockReturnValue(response) };
    updateProduct = { execute: jest.fn() };
    notifications = { success: jest.fn(), error: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ProductEditPage],
      providers: [
        provideRouter([]),
        { provide: GetProductByIdUseCase, useValue: getProductById },
        { provide: UpdateProductUseCase, useValue: updateProduct },
        { provide: VerifyProductIdUseCase, useValue: { execute: jest.fn() } },
        { provide: NotificationService, useValue: notifications },
        { provide: CLOCK, useValue: () => new Date(2026, 10, 9) },
      ],
    });
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProductEditPage);
    fixture.componentRef.setInput('id', 'trj-crd');
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  };

  const save = (edited: Product) => {
    fixture.debugElement
      .query((node) => node.name === 'app-product-form')
      .triggerEventHandler('save', edited);
    fixture.detectChanges();
  };

  it('muestra un skeleton mientras carga el producto', () => {
    setup(new Subject<Product>());

    expect(element.querySelector('[data-testid="form-skeleton"]')).not.toBeNull();
    expect(element.querySelector('app-product-form')).toBeNull();
  });

  it('carga el producto de la ruta y lo muestra en el formulario', () => {
    setup();

    expect(getProductById.execute).toHaveBeenCalledWith('trj-crd');
    expect(element.querySelector('h1')!.textContent).toContain('Editar Producto');
    expect(element.querySelector<HTMLInputElement>('#product-id')!.value).toBe('trj-crd');
    expect(element.querySelector<HTMLInputElement>('#product-id')!.disabled).toBe(true);
    expect(element.querySelector('button[type="submit"]')!.textContent).toContain('Guardar');
  });

  it('muestra el error si el producto no existe y permite reintentar', () => {
    setup(throwError(() => new AppError('not-found', 'El producto no existe o ya fue eliminado.')));

    expect(element.querySelector('[role="alert"]')!.textContent).toContain(
      'El producto no existe o ya fue eliminado.',
    );
    expect(element.querySelector('a.btn')!.getAttribute('href')).toBe('/products');

    getProductById.execute.mockReturnValue(of(product));
    element.querySelector<HTMLButtonElement>('.edit-error button')!.click();
    fixture.detectChanges();

    expect(element.querySelector('app-product-form')).not.toBeNull();
  });

  it('actualiza el producto, notifica y vuelve al listado', () => {
    setup();
    const edited = { ...product, name: 'Tarjeta Oro' };
    updateProduct.execute.mockReturnValue(of(edited));

    save(edited);

    expect(updateProduct.execute).toHaveBeenCalledWith(edited);
    expect(notifications.success).toHaveBeenCalledWith(PRODUCT_UPDATED_MESSAGE);
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('muestra el error y se queda en el formulario si la actualización falla', () => {
    setup();
    updateProduct.execute.mockReturnValue(
      throwError(() => new AppError('not-found', 'El producto no existe o ya fue eliminado.')),
    );

    save(product);

    expect(notifications.error).toHaveBeenCalledWith('El producto no existe o ya fue eliminado.');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(element.querySelector('button[type="submit"]')!.textContent).toContain('Guardar');
  });
});
