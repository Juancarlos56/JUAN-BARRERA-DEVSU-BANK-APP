import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ProductRepository } from '../../domain';
import { buildProduct } from '../../testing/product.fixtures';
import {
  ProductRepositoryMock,
  createProductRepositoryMock,
} from '../../testing/product-repository.mock';
import { CreateProductUseCase } from './create-product.use-case';
import { DeleteProductUseCase } from './delete-product.use-case';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { GetProductsUseCase } from './get-products.use-case';
import { UpdateProductUseCase } from './update-product.use-case';
import { VerifyProductIdUseCase } from './verify-product-id.use-case';

describe('Casos de uso de productos', () => {
  let repository: ProductRepositoryMock;

  beforeEach(() => {
    repository = createProductRepositoryMock();
    TestBed.configureTestingModule({
      providers: [{ provide: ProductRepository, useValue: repository }],
    });
  });

  it('GetProductsUseCase devuelve los productos del repositorio', async () => {
    const products = [buildProduct()];
    repository.getAll.mockReturnValue(of(products));

    const result = await firstValueFrom(TestBed.inject(GetProductsUseCase).execute());

    expect(result).toBe(products);
  });

  it('GetProductByIdUseCase busca por id sin espacios', async () => {
    repository.getById.mockReturnValue(of(buildProduct()));

    await firstValueFrom(TestBed.inject(GetProductByIdUseCase).execute('  trj-crd '));

    expect(repository.getById).toHaveBeenCalledWith('trj-crd');
  });

  it('CreateProductUseCase normaliza los textos antes de crear', async () => {
    const product = buildProduct();
    repository.create.mockReturnValue(of(product));

    await firstValueFrom(
      TestBed.inject(CreateProductUseCase).execute({
        ...product,
        id: ' trj-crd ',
        name: ' Tarjetas de Crédito ',
        description: ' Tarjeta de consumo bajo la modalidad de crédito ',
        logo: ' https://example.com/logo.png ',
      }),
    );

    expect(repository.create).toHaveBeenCalledWith(product);
  });

  it('UpdateProductUseCase normaliza los textos antes de actualizar', async () => {
    const product = buildProduct({ name: 'Nombre actualizado' });
    repository.update.mockReturnValue(of(product));

    const result = await firstValueFrom(
      TestBed.inject(UpdateProductUseCase).execute({ ...product, name: 'Nombre actualizado  ' }),
    );

    expect(repository.update).toHaveBeenCalledWith(product);
    expect(result).toBe(product);
  });

  it('DeleteProductUseCase elimina por id', async () => {
    repository.delete.mockReturnValue(of(undefined));

    await firstValueFrom(TestBed.inject(DeleteProductUseCase).execute('trj-crd'));

    expect(repository.delete).toHaveBeenCalledWith('trj-crd');
  });

  it('VerifyProductIdUseCase consulta si el id existe', async () => {
    repository.existsById.mockReturnValue(of(true));

    const exists = await firstValueFrom(TestBed.inject(VerifyProductIdUseCase).execute(' abc '));

    expect(repository.existsById).toHaveBeenCalledWith('abc');
    expect(exists).toBe(true);
  });
});
