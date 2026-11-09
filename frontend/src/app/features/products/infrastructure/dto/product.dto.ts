/** Estructura del producto tal como la expone la API (snake_case). */
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/** Cuerpo del PUT: la API no recibe el `id` en el body, va en la URL. */
export type UpdateProductDto = Omit<ProductDto, 'id'>;

export interface ProductListResponseDto {
  data: ProductDto[];
}

export interface ProductMutationResponseDto<T> {
  message: string;
  data: T;
}
