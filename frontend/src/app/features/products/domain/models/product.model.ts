/**
 * Fecha de calendario en formato ISO `YYYY-MM-DD`.
 * Se maneja como texto para evitar desfases por zona horaria
 * (`new Date('2025-01-01')` se interpreta en UTC).
 */
export type IsoDate = string;

/** Entidad de dominio: producto financiero ofertado por el banco. */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly logo: string;
  readonly dateRelease: IsoDate;
  readonly dateRevision: IsoDate;
}
