import { IsoDate, Product } from '../../domain';
import { ProductDto, UpdateProductDto } from '../dto/product.dto';

const ISO_DATE_LENGTH = 'YYYY-MM-DD'.length;

/**
 * Normaliza la fecha a `YYYY-MM-DD`. La API puede devolver solo la fecha
 * o un timestamp completo (`2025-01-01T00:00:00.000Z`) según cómo se haya creado.
 */
const toIsoDate = (value: string): IsoDate => value.slice(0, ISO_DATE_LENGTH);

/** Traduce entre el contrato de la API y la entidad de dominio. */
export const ProductMapper = {
  toDomain(dto: ProductDto): Product {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      dateRelease: toIsoDate(dto.date_release),
      dateRevision: toIsoDate(dto.date_revision),
    };
  },

  toDto(product: Product): ProductDto {
    return { id: product.id, ...ProductMapper.toUpdateDto(product) };
  },

  toUpdateDto(product: Product): UpdateProductDto {
    return {
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.dateRelease,
      date_revision: product.dateRevision,
    };
  },
} as const;
