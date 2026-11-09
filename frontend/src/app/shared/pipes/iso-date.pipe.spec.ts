import { IsoDatePipe } from './iso-date.pipe';

describe('IsoDatePipe', () => {
  const pipe = new IsoDatePipe();

  it.each([
    ['2025-02-01', '01/02/2025'],
    ['2025-12-31T00:00:00.000Z', '31/12/2025'],
    ['texto', 'texto'],
    ['', ''],
    [null, ''],
    [undefined, ''],
  ])('%p → %p', (value, expected) => {
    expect(pipe.transform(value)).toBe(expected);
  });
});
