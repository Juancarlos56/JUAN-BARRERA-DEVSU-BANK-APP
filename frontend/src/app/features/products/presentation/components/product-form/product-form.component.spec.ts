import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CLOCK } from '@core/config/clock';
import { VerifyProductIdUseCase } from '../../../application';
import { Product } from '../../../domain';
import { ID_VERIFICATION_DEBOUNCE_MS } from '../../forms/product-form.validators';
import { ProductFormComponent } from './product-form.component';

const VALID_VALUES = {
  'product-id': 'trj-new',
  'product-name': 'Tarjeta Platinum',
  'product-description': 'Tarjeta de crédito con beneficios',
  'product-logo': 'https://example.com/logo.png',
  'product-date-release': '2026-12-01',
} as const;

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let element: HTMLElement;
  let verify: { execute: jest.Mock };
  let saved: Product[];

  beforeEach(() => {
    jest.useFakeTimers();
    verify = { execute: jest.fn().mockReturnValue(of(false)) };
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: VerifyProductIdUseCase, useValue: verify },
        { provide: CLOCK, useValue: () => new Date(2026, 10, 9) },
      ],
    });
    fixture = TestBed.createComponent(ProductFormComponent);
    element = fixture.nativeElement as HTMLElement;
    saved = [];
    fixture.componentInstance.save.subscribe((product) => saved.push(product));
    fixture.detectChanges();
  });

  afterEach(() => jest.useRealTimers());

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const type = (id: string, value: string) => {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };
  const settleAsyncValidation = () => {
    jest.advanceTimersByTime(ID_VERIFICATION_DEBOUNCE_MS);
    fixture.detectChanges();
  };
  const fillValidForm = () => {
    Object.entries(VALID_VALUES).forEach(([id, value]) => type(id, value));
    settleAsyncValidation();
  };
  const errorOf = (id: string) =>
    element.querySelector(`#${id}-message .form-field__error`)?.textContent?.trim() ?? null;
  const submitButton = () => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  it('muestra los campos del diseño D2 y el botón Agregar deshabilitado al inicio', () => {
    const labels = Array.from(element.querySelectorAll('label')).map((l) => l.textContent!.trim());

    expect(labels).toEqual([
      'ID',
      'Nombre',
      'Descripción',
      'Logo',
      'Fecha Liberación',
      'Fecha Revisión',
    ]);
    expect(submitButton().textContent!.trim()).toBe('Agregar');
    expect(submitButton().disabled).toBe(true);
  });

  it('no muestra errores antes de que el usuario interactúe', () => {
    expect(element.querySelectorAll('.form-field__error')).toHaveLength(0);
  });

  it('muestra "Este campo es requerido!" al dejar un campo vacío', () => {
    type('product-name', '');

    expect(errorOf('product-name')).toBe('Este campo es requerido!');
    expect(input('product-name').getAttribute('aria-invalid')).toBe('true');
  });

  it.each([
    ['product-id', 'ab', 'ID no válido! Debe tener mínimo 3 caracteres.'],
    ['product-name', 'Tarj', 'Debe tener mínimo 5 caracteres.'],
    ['product-description', 'Corta', 'Debe tener mínimo 10 caracteres.'],
    ['product-date-release', '2026-11-08', 'La fecha debe ser igual o mayor a la fecha actual.'],
  ])('valida %s con valor %p', (id, value, message) => {
    type(id, value);

    expect(errorOf(id)).toBe(message);
  });

  it('valida el máximo de caracteres', () => {
    type('product-id', 'a'.repeat(11));
    type('product-name', 'a'.repeat(101));
    type('product-description', 'a'.repeat(201));

    expect(errorOf('product-id')).toBe('ID no válido! Debe tener máximo 10 caracteres.');
    expect(errorOf('product-name')).toBe('Debe tener máximo 100 caracteres.');
    expect(errorOf('product-description')).toBe('Debe tener máximo 200 caracteres.');
  });

  it('acepta como fecha de liberación el día de hoy', () => {
    type('product-date-release', '2026-11-09');

    expect(errorOf('product-date-release')).toBeNull();
  });

  it('calcula la fecha de revisión un año después de la liberación', () => {
    type('product-date-release', '2026-12-01');

    expect(input('product-date-revision').value).toBe('2027-12-01');
    expect(input('product-date-revision').readOnly).toBe(true);
  });

  it('muestra el error de la fecha de revisión si se borra la liberación ya tocada', () => {
    type('product-date-release', '2026-12-01');
    type('product-date-release', '');

    expect(input('product-date-revision').value).toBe('');
    expect(errorOf('product-date-revision')).toBe('Este campo es requerido!');
  });

  it('muestra "ID no válido!" si el id ya existe', () => {
    verify.execute.mockReturnValue(of(true));

    type('product-id', 'trj-crd');
    expect(element.textContent).toContain('Verificando ID...');

    settleAsyncValidation();

    expect(verify.execute).toHaveBeenCalledWith('trj-crd');
    expect(errorOf('product-id')).toBe('ID no válido! Ya existe un producto con este ID.');
  });

  it('informa si no se pudo verificar el id', () => {
    verify.execute.mockReturnValue(throwError(() => new Error('red')));

    type('product-id', 'trj-crd');
    settleAsyncValidation();

    expect(errorOf('product-id')).toBe('No se pudo verificar el ID. Intenta nuevamente.');
  });

  it('habilita Agregar y emite el producto cuando el formulario es válido', () => {
    fillValidForm();

    expect(submitButton().disabled).toBe(false);
    submitButton().click();

    expect(saved).toEqual([
      {
        id: 'trj-new',
        name: 'Tarjeta Platinum',
        description: 'Tarjeta de crédito con beneficios',
        logo: 'https://example.com/logo.png',
        dateRelease: '2026-12-01',
        dateRevision: '2027-12-01',
      },
    ]);
  });

  it('no emite si el formulario es inválido y marca todos los campos', () => {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saved).toEqual([]);
    expect(errorOf('product-id')).toBe('Este campo es requerido!');
    expect(errorOf('product-logo')).toBe('Este campo es requerido!');
  });

  it('deshabilita Agregar y muestra "Guardando..." mientras se envía', () => {
    fillValidForm();
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent!.trim()).toBe('Guardando...');
  });

  it('Reiniciar limpia todos los campos y los errores', () => {
    fillValidForm();
    type('product-name', '');

    element.querySelector<HTMLButtonElement>('button.btn--secondary')!.click();
    fixture.detectChanges();

    Object.keys(VALID_VALUES).forEach((id) => expect(input(id).value).toBe(''));
    expect(input('product-date-revision').value).toBe('');
    expect(element.querySelectorAll('.form-field__error')).toHaveLength(0);
  });
});
