import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/config/api.config';
import { buildProduct, buildProductDto } from '../../testing/product.fixtures';
import { ProductMapper } from '../mappers/product.mapper';
import { HttpProductRepository } from './http-product.repository';

describe('HttpProductRepository', () => {
  const baseUrl = 'http://api.test/bp/products';
  let repository: HttpProductRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpProductRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test/bp' },
      ],
    });
    repository = TestBed.inject(HttpProductRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll obtiene y mapea la lista de productos', () => {
    let result: unknown;
    repository.getAll().subscribe((products) => (result = products));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [buildProductDto()] });

    expect(result).toEqual([buildProduct()]);
  });

  it('getById obtiene un producto por su id', () => {
    let result: unknown;
    repository.getById('trj-crd').subscribe((product) => (result = product));

    const req = httpMock.expectOne(`${baseUrl}/trj-crd`);
    expect(req.request.method).toBe('GET');
    req.flush(buildProductDto());

    expect(result).toEqual(buildProduct());
  });

  it('create envía el producto en formato de la API y devuelve el creado', () => {
    let result: unknown;
    repository.create(buildProduct()).subscribe((product) => (result = product));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(buildProductDto());
    req.flush({ message: 'Product added successfully', data: buildProductDto() });

    expect(result).toEqual(buildProduct());
  });

  it('update envía el body sin id y conserva el id en la respuesta', () => {
    const product = buildProduct({ name: 'Nombre actualizado' });
    let result: unknown;
    repository.update(product).subscribe((updated) => (result = updated));

    const req = httpMock.expectOne(`${baseUrl}/trj-crd`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).not.toHaveProperty('id');
    req.flush({
      message: 'Product updated successfully',
      data: ProductMapper.toUpdateDto(product),
    });

    expect(result).toEqual(product);
  });

  it('delete elimina el producto y completa sin valor', () => {
    let completed = false;
    let value: unknown = 'sin-emitir';
    repository.delete('trj-crd').subscribe({
      next: (v) => (value = v),
      complete: () => (completed = true),
    });

    const req = httpMock.expectOne(`${baseUrl}/trj-crd`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Product removed successfully' });

    expect(value).toBeUndefined();
    expect(completed).toBe(true);
  });

  it('existsById consulta el servicio de verificación', () => {
    let result: boolean | undefined;
    repository.existsById('trj-crd').subscribe((exists) => (result = exists));

    const req = httpMock.expectOne(`${baseUrl}/verification/trj-crd`);
    expect(req.request.method).toBe('GET');
    req.flush(true);

    expect(result).toBe(true);
  });

  it('codifica ids con caracteres especiales en la URL', () => {
    repository.getById('a b/c').subscribe();

    httpMock.expectOne(`${baseUrl}/a%20b%2Fc`).flush(buildProductDto());
  });
});
