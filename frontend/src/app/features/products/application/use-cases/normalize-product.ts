import { Product } from '../../domain';

/** Elimina espacios sobrantes de los campos de texto antes de persistir. */
export const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: product.id.trim(),
  name: product.name.trim(),
  description: product.description.trim(),
  logo: product.logo.trim(),
});
