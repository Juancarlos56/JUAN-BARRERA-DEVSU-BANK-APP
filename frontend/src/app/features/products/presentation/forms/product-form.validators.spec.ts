import { FormControl, FormGroup } from '@angular/forms';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import { VerifyProductIdUseCase } from '../../application';
import {
  productIdAvailableValidator,
  releaseDateValidator,
  requiredTrimmed,
  revisionDateValidator,
} from './product-form.validators';

describe('requiredTrimmed', () => {
  it.each([
    ['abc', null],
    ['', { required: true }],
    ['   ', { required: true }],
    [null, { required: true }],
  ])('%p → %p', (value, expected) => {
    expect(requiredTrimmed(new FormControl(value))).toEqual(expected);
  });
});

describe('releaseDateValidator', () => {
  const validator = releaseDateValidator(() => '2026-11-09');

  it.each([
    ['', null],
    ['2026-11-09', null],
    ['2027-01-01', null],
    ['2026-11-08', { releaseDateInPast: { min: '2026-11-09' } }],
    ['2026-02-30', { invalidDate: true }],
  ])('%p → %p', (value, expected) => {
    expect(validator(new FormControl(value))).toEqual(expected);
  });
});

describe('revisionDateValidator', () => {
  const buildGroup = (release: string, revision: string) => {
    const group = new FormGroup({
      dateRelease: new FormControl(release),
      dateRevision: new FormControl(revision, revisionDateValidator('dateRelease')),
    });
    // El validador lee el control hermano: se revalida cuando ya existe el grupo.
    group.controls.dateRevision.updateValueAndValidity();
    return group;
  };

  it('es válido cuando es exactamente un año después', () => {
    expect(buildGroup('2026-11-09', '2027-11-09').controls.dateRevision.errors).toBeNull();
  });

  it('marca error cuando no es exactamente un año después', () => {
    expect(buildGroup('2026-11-09', '2027-11-10').controls.dateRevision.errors).toEqual({
      revisionDateMismatch: true,
    });
  });

  it('marca error si la fecha no es válida', () => {
    expect(buildGroup('2026-11-09', '2027-02-30').controls.dateRevision.errors).toEqual({
      invalidDate: true,
    });
  });

  it('no valida si falta alguna de las fechas o no tiene grupo', () => {
    expect(buildGroup('', '2027-11-09').controls.dateRevision.errors).toBeNull();
    expect(buildGroup('2026-11-09', '').controls.dateRevision.errors).toBeNull();
    expect(revisionDateValidator('dateRelease')(new FormControl('2027-11-09'))).toBeNull();
  });
});

describe('productIdAvailableValidator', () => {
  const verifyWith = (response: Observable<boolean>) =>
    ({ execute: jest.fn().mockReturnValue(response) }) as unknown as VerifyProductIdUseCase & {
      execute: jest.Mock;
    };

  it('no consulta la API si el id está vacío', async () => {
    const verify = verifyWith(of(false));

    const result = await firstValueFrom(
      productIdAvailableValidator(verify, 0)(new FormControl('  ')) as Observable<unknown>,
    );

    expect(result).toBeNull();
    expect(verify.execute).not.toHaveBeenCalled();
  });

  it('es válido si el id no existe', async () => {
    const verify = verifyWith(of(false));

    const result = await firstValueFrom(
      productIdAvailableValidator(verify, 0)(new FormControl(' nuevo ')) as Observable<unknown>,
    );

    expect(result).toBeNull();
    expect(verify.execute).toHaveBeenCalledWith('nuevo');
  });

  it('marca idTaken si el id ya existe', async () => {
    const result = await firstValueFrom(
      productIdAvailableValidator(
        verifyWith(of(true)),
        0,
      )(new FormControl('trj-crd')) as Observable<unknown>,
    );

    expect(result).toEqual({ idTaken: true });
  });

  it('marca idUnverified si la verificación falla', async () => {
    const result = await firstValueFrom(
      productIdAvailableValidator(
        verifyWith(throwError(() => new Error('red'))),
        0,
      )(new FormControl('trj-crd')) as Observable<unknown>,
    );

    expect(result).toEqual({ idUnverified: true });
  });

  it('espera el debounce antes de consultar', () => {
    jest.useFakeTimers();
    const verify = verifyWith(of(false));

    (
      productIdAvailableValidator(verify, 400)(new FormControl('abc')) as Observable<unknown>
    ).subscribe();
    jest.advanceTimersByTime(399);
    expect(verify.execute).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(verify.execute).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
