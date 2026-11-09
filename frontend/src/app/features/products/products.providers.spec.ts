import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ProductRepository } from './domain';
import { HttpProductRepository } from './infrastructure/repositories/http-product.repository';
import { provideProducts } from './products.providers';

describe('provideProducts', () => {
  it('enlaza el puerto ProductRepository con el adaptador HTTP', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideProducts()] });

    expect(TestBed.inject(ProductRepository)).toBeInstanceOf(HttpProductRepository);
  });
});
