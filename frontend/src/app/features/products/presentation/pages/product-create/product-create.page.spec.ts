import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { AppError } from '@core/errors/app-error';
import { NotificationService } from '@core/notifications/notification.service';
import { CreateProductUseCase, VerifyProductIdUseCase } from '../../../application';
import { Product } from '../../../domain';
import { buildProduct } from '../../../testing/product.fixtures';
import { PRODUCT_CREATED_MESSAGE, ProductCreatePage } from './product-create.page';

describe('ProductCreatePage', () => {
  let fixture: ComponentFixture<ProductCreatePage>;
  let element: HTMLElement;
  let createProduct: { execute: jest.Mock };
  let notifications: { success: jest.Mock; error: jest.Mock };
  let router: Router;

  beforeEach(() => {
    createProduct = { execute: jest.fn() };
    notifications = { success: jest.fn(), error: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ProductCreatePage],
      providers: [
        provideRouter([]),
        { provide: CreateProductUseCase, useValue: createProduct },
        { provide: VerifyProductIdUseCase, useValue: { execute: () => of(false) } },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProductCreatePage);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  const save = (product: Product) => {
    const form = fixture.debugElement.query((node) => node.name === 'app-product-form');
    form.triggerEventHandler('save', product);
    fixture.detectChanges();
  };

  it('muestra el título "Formulario de Registro" y el formulario', () => {
    expect(element.querySelector('h1')!.textContent).toContain('Formulario de Registro');
    expect(element.querySelector('app-product-form')).not.toBeNull();
  });

  it('crea el producto, notifica y vuelve al listado', () => {
    const product = buildProduct();
    createProduct.execute.mockReturnValue(of(product));

    save(product);

    expect(createProduct.execute).toHaveBeenCalledWith(product);
    expect(notifications.success).toHaveBeenCalledWith(PRODUCT_CREATED_MESSAGE);
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('indica al formulario que se está guardando mientras espera la respuesta', () => {
    const response = new Subject<Product>();
    createProduct.execute.mockReturnValue(response);

    save(buildProduct());
    expect(element.querySelector('button[type="submit"]')!.textContent).toContain('Guardando...');

    response.next(buildProduct());
    response.complete();
    fixture.detectChanges();
    expect(element.querySelector('button[type="submit"]')!.textContent).toContain('Agregar');
  });

  it('muestra el error y se queda en el formulario si la creación falla', () => {
    createProduct.execute.mockReturnValue(
      throwError(() => new AppError('conflict', 'Ya existe un producto con ese ID.')),
    );

    save(buildProduct());

    expect(notifications.error).toHaveBeenCalledWith('Ya existe un producto con ese ID.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
