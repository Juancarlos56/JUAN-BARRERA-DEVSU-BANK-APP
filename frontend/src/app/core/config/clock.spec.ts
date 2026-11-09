import { TestBed } from '@angular/core/testing';

import { CLOCK } from './clock';

describe('CLOCK', () => {
  it('devuelve la fecha actual por defecto', () => {
    const before = Date.now();

    const now = TestBed.inject(CLOCK)().getTime();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
