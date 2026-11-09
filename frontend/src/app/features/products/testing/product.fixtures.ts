import { Product } from '../domain';
import { ProductDto } from '../infrastructure/dto/product.dto';

/** Datos de prueba reutilizables (solo para specs). */
export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  dateRelease: '2025-02-01',
  dateRevision: '2026-02-01',
  ...overrides,
});

export const buildProductDto = (overrides: Partial<ProductDto> = {}): ProductDto => ({
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  date_release: '2025-02-01',
  date_revision: '2026-02-01',
  ...overrides,
});
