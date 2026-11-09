import { addYearsToIsoDate, isIsoDate } from '@shared/utils/date.utils';
import { IsoDate } from '../models/product.model';
import { PRODUCT_RULES } from './product.rules';

/** Reglas de negocio sobre las fechas del producto (F4). */
export const ProductDateRules = {
  /** La fecha de liberación debe ser igual o mayor a la fecha actual. */
  isReleaseDateAllowed(release: IsoDate, today: IsoDate): boolean {
    // Con formato YYYY-MM-DD la comparación de texto equivale a la cronológica.
    return isIsoDate(release) && release >= today;
  },

  /** Fecha de revisión que corresponde a una fecha de liberación. */
  revisionDateFor(release: IsoDate): IsoDate {
    return addYearsToIsoDate(release, PRODUCT_RULES.revisionYearsAfterRelease);
  },

  /** La fecha de revisión debe ser exactamente un año posterior a la de liberación. */
  isRevisionDateValid(release: IsoDate, revision: IsoDate): boolean {
    return isIsoDate(revision) && revision === ProductDateRules.revisionDateFor(release);
  },
} as const;
