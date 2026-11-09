import { normalizeText } from '@shared/utils/text.utils';
import { Product } from '../../domain';

/** Campos sobre los que se aplica la búsqueda de texto (F2). */
const SEARCHABLE_FIELDS = [
  'id',
  'name',
  'description',
] as const satisfies readonly (keyof Product)[];

/** Filtra productos por coincidencia parcial, sin distinguir mayúsculas ni tildes. */
export const filterProducts = (products: readonly Product[], term: string): Product[] => {
  const query = normalizeText(term);
  if (!query) {
    return [...products];
  }
  return products.filter((product) =>
    SEARCHABLE_FIELDS.some((field) => normalizeText(product[field]).includes(query)),
  );
};
