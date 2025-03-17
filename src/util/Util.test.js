
import { isNumeric, randint, round, sum, toNumerical, turnSquareBracketsIntoArrays } from "./Util.js";

test("isNumeric function", () => {
	expect(isNumeric("1.2")).toBe(true);
	expect(isNumeric(0)).toBe(true);
	expect(isNumeric("NaN")).toBe(false);
	expect(isNumeric("hey")).toBe(false);
  });
   
  test("toNumerical function", () => {
	expect(toNumerical(2)).toBe(2);
	expect(toNumerical([1, 2, 3])).toEqual([1, 2, 3]);
	expect(Array.isArray(toNumerical([0]))).toBe(true);
	expect(toNumerical("8")).toBe(8);
	expect(toNumerical([1, 2, "3"])).toEqual([1, 2, 3]);
	expect(toNumerical(...turnSquareBracketsIntoArrays("[1, 2, 3][]]", 2))).toEqual([1, 2, 3]);
   
  });
   
  test("randint function", () => {
	for (let i = 0; i < 100; i++) {
	  expect(randint()).toBe(0);
	  expect(randint(1)).toBe(0);
	  expect(randint(1)).toBeGreaterThanOrEqual(0);
	  expect(randint(1)).toBeLessThan(1);
	  expect(randint(null)).toBe(0);
	}
   
	for (let i = 100; i > 0; i--) {
	  expect(randint(i)).toBeLessThan(i);
	}
   
	for (let i = -99; i < 0; i++) {
	  expect(randint(2 * i, i)).toBeLessThanOrEqual(i);
	}
   
	expect(() => randint(0, -10)).toThrowError(
	  expect.objectContaining({ error: "min should be <= max" })
   
	);
  });
   
  test("round function", () => {
	const actual = [10, 1.7777777, 9.1];
	const expected = [10, 1.78, 9.1];
	expect(actual.map((input) => round(input, 2))).toEqual(expected);
   
  
  });
   

  test("sum function", () => {  
	expect(sum(null)).toBe(0);
	expect(sum()).toBe(0);
	expect(sum([0])).toBe(0);
	expect(sum([1, NaN, null, undefined])).toBe(1);
	expect(sum([1, 2, -3])).toBe(0);
	expect(sum(["a1", 2])).toBe(2);
  });
