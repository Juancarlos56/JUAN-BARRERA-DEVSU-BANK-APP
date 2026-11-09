import { buildProduct, buildProductDto } from '../../testing/product.fixtures';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  it('convierte el DTO de la API a la entidad de dominio', () => {
    expect(ProductMapper.toDomain(buildProductDto())).toEqual(buildProduct());
  });

  it('normaliza fechas con hora a formato YYYY-MM-DD', () => {
    const dto = buildProductDto({
      date_release: '2025-02-01T00:00:00.000Z',
      date_revision: '2026-02-01T05:00:00.000Z',
    });

    const product = ProductMapper.toDomain(dto);

    expect(product.dateRelease).toBe('2025-02-01');
    expect(product.dateRevision).toBe('2026-02-01');
  });

  it('convierte la entidad al DTO de creación incluyendo el id', () => {
    expect(ProductMapper.toDto(buildProduct())).toEqual(buildProductDto());
  });

  it('convierte la entidad al DTO de actualización sin el id', () => {
    const dto = ProductMapper.toUpdateDto(buildProduct());

    expect(dto).not.toHaveProperty('id');
    expect(dto).toEqual({
      name: 'Tarjetas de Crédito',
      description: 'Tarjeta de consumo bajo la modalidad de crédito',
      logo: 'https://example.com/logo.png',
      date_release: '2025-02-01',
      date_revision: '2026-02-01',
    });
  });
});
