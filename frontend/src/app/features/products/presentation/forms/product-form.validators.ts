import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

import { isIsoDate } from '@shared/utils/date.utils';
import { VerifyProductIdUseCase } from '../../application';
import { ProductDateRules } from '../../domain';

export const ID_VERIFICATION_DEBOUNCE_MS = 400;

/** Requerido que además rechaza valores formados solo por espacios. */
export const requiredTrimmed: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

/** La fecha de liberación debe ser una fecha válida igual o mayor a hoy. */
export const releaseDateValidator =
  (getToday: () => string): ValidatorFn =>
  ({ value }: AbstractControl<string>) => {
    if (!value) {
      return null;
    }
    if (!isIsoDate(value)) {
      return { invalidDate: true };
    }
    return ProductDateRules.isReleaseDateAllowed(value, getToday())
      ? null
      : { releaseDateInPast: { min: getToday() } };
  };

/** La fecha de revisión debe ser exactamente un año posterior a la de liberación. */
export const revisionDateValidator =
  (releaseControlName: string): ValidatorFn =>
  (control: AbstractControl<string>) => {
    const release: unknown = control.parent?.get(releaseControlName)?.value;
    const revision = control.value;
    if (!revision || typeof release !== 'string' || !release) {
      return null;
    }
    if (!isIsoDate(revision)) {
      return { invalidDate: true };
    }
    return ProductDateRules.isRevisionDateValid(release, revision)
      ? null
      : { revisionDateMismatch: true };
  };

/**
 * Valida contra la API que el id no exista. El `timer` actúa como debounce:
 * Angular cancela la validación anterior cuando el valor cambia.
 */
export const productIdAvailableValidator =
  (
    verifyProductId: VerifyProductIdUseCase,
    debounceMs = ID_VERIFICATION_DEBOUNCE_MS,
  ): AsyncValidatorFn =>
  (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    const id = control.value?.trim();
    if (!id) {
      return of(null);
    }
    return timer(debounceMs).pipe(
      switchMap(() => verifyProductId.execute(id)),
      map((exists) => (exists ? { idTaken: true } : null)),
      catchError(() => of({ idUnverified: true })),
    );
  };
