/**
 * Reglas de negocio del producto financiero definidas en el enunciado (F4).
 * Centralizarlas evita "números mágicos" repartidos entre validadores y vistas.
 */
export const PRODUCT_RULES = {
  id: { minLength: 3, maxLength: 10 },
  name: { minLength: 5, maxLength: 100 },
  description: { minLength: 10, maxLength: 200 },
  /** La fecha de revisión debe ser exactamente este número de años posterior a la de liberación. */
  revisionYearsAfterRelease: 1,
} as const;
