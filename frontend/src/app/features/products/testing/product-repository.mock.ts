import { ProductRepository } from '../domain';

export type ProductRepositoryMock = jest.Mocked<ProductRepository>;

/** Doble de prueba del puerto: permite probar la capa de aplicación sin HTTP. */
export const createProductRepositoryMock = (): ProductRepositoryMock => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsById: jest.fn(),
});
