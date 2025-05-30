import { range, isEmpty } from '../../../src/util/Util.js';




describe('range()', () => {
  test('generates numbers from 0 to stop (exclusive)', () => {
    const result = range(5);
    expect(result).toEqual([0, 1, 2, 3, 4]);  
  });

  test('generates numbers from start to stop (exclusive)', () => {
    const result = range(2, 6);
    expect(result).toEqual([2, 3, 4, 5]);
  });

  test('works with step value', () => {
    const result = range(1, 10, 3);
    expect(result).toEqual([1, 4, 7]);
  });

  test('returns empty array if start >= stop', () => {
    const result = range(5, 2);
    expect(result).toEqual([]);
  });

  test('throws error if arguments are not integers', () => {
    expect(() => range(1.5, 5)).toThrow();
    expect(() => range(0, '5')).toThrow();
  });
});




describe('isEmpty()', () => {
  test('returns true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  test('returns true for [undefined]', () => {
    expect(isEmpty([undefined])).toBe(true);
  });

  test('returns false for non-empty array', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  test('returns false for non-array object', () => {
    expect(isEmpty(42)).toBe(false);
    expect(isEmpty('hello')).toBe(false);
  });
});
