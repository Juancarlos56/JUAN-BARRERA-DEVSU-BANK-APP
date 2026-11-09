import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '@core/config/api.config';
import { Product, ProductRepository } from '../../domain';
import {
  ProductDto,
  ProductListResponseDto,
  ProductMutationResponseDto,
  UpdateProductDto,
} from '../dto/product.dto';
import { ProductMapper } from '../mappers/product.mapper';

/** Adaptador HTTP del puerto `ProductRepository` contra la API `/bp/products`. */
@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/products`;

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductListResponseDto>(this.baseUrl)
      .pipe(map(({ data }) => data.map(ProductMapper.toDomain)));
  }

  getById(id: string): Observable<Product> {
    return this.http.get<ProductDto>(this.urlFor(id)).pipe(map(ProductMapper.toDomain));
  }

  create(product: Product): Observable<Product> {
    return this.http
      .post<ProductMutationResponseDto<ProductDto>>(this.baseUrl, ProductMapper.toDto(product))
      .pipe(map(({ data }) => ProductMapper.toDomain(data)));
  }

  update(product: Product): Observable<Product> {
    return this.http
      .put<ProductMutationResponseDto<UpdateProductDto>>(
        this.urlFor(product.id),
        ProductMapper.toUpdateDto(product),
      )
      .pipe(map(({ data }) => ProductMapper.toDomain({ ...data, id: product.id })));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<unknown>(this.urlFor(id)).pipe(map(() => undefined));
  }

  existsById(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${encodeURIComponent(id)}`);
  }

  private urlFor(id: string): string {
    return `${this.baseUrl}/${encodeURIComponent(id)}`;
  }
}
