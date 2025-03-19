// PsychObject.test.js

import { PsychObject } from "../../src/util/PsychObject.js";

// Mock logger
class MockLogger {
  warn = jest.fn();
}

class MockPsychoJS {
  constructor() {
    this.logger = new MockLogger();
  }
}

describe("PsychObject", () => {
  let mockPsychoJS;
  let po;

  beforeEach(() => {
    mockPsychoJS = new MockPsychoJS();
    po = new PsychObject(mockPsychoJS);
  });

  test("Initialisation: _psychoJS, _userAttributes, name", () => {
    expect(po.psychoJS).toBe(mockPsychoJS);
    expect(po._userAttributes).toBeInstanceOf(Set);
    expect(po.name).toBe("PsychObject"); 
  });

  test("toString() return row with attributes", () => {
    // Only one instance name
    const str = po.toString();
    expect(str).toContain("PsychObject(");
    expect(str).toContain("name=PsychObject");
  });

  test("_addAttribute() should add new attribute with getters and setters", () => {
    po._addAttribute("foo", 123);
    expect(po.foo).toBe(123);
    po.foo = 456;
    expect(po.foo).toBe(456);
    expect(po._userAttributes.has("foo")).toBe(true);
  });

  test("Calling _setAttribute() with array and operation +", () => {
    po._addAttribute("positions", [1, 2, 3]);
    po._setAttribute("positions", [10, 20, 30], false, "+");
    expect(po.positions).toEqual([11, 22, 33]);
  });

  test("Calling _setAttribute() with operations * (array)", () => {
    po._addAttribute("scale", [2, 4]);
    po._setAttribute("scale", 5, false, "*");
    expect(po.scale).toEqual([10, 20]);
  });

  test("Calling _setAttribute() scalar + scalar", () => {
    po._addAttribute("value", 10);
    po._setAttribute("value", 3, false, "+");
    expect(po.value).toBe(13);
  });

  test("Attempt _setAttribute() with undifened should calling  logger.warn", () => {
    po._addAttribute("testAttr", 999);
    po._setAttribute("testAttr", undefined);
    expect(mockPsychoJS.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("undefined")
    );
    expect(po.testAttr).toBeUndefined();
  });

  test("_setAttribute() returns true if value changed", () => {
    po._addAttribute("someAttr", 100);
    const hasChanged = po._setAttribute("someAttr", 200);
    expect(hasChanged).toBe(true);
    expect(po.someAttr).toBe(200);
  });

  test("_setAttribute() returns false if value hasn`t been changed", () => {
    po._addAttribute("unchanged", "hello");
    const hasChanged = po._setAttribute("unchanged", "hello"); 
    expect(hasChanged).toBe(false);
  });

  test("Using operations with not equal lenghts", () => {
    expect.assertions(1);
    po._addAttribute("arrayAttr", [1, 2]);
    try {
        po._setAttribute("arrayAttr", [10, 20, 30], false, "+");
        // Якщо сюди дійшло – помилки не було
        fail("Повинна була виникнути помилка, але не виникла");
    } catch (e) {
        expect(e.error).toMatch(/should have the same size/);
    }
  });

  test("Using incorrect operation", () => {
    expect.assertions(1);
    po._addAttribute("foo", 2);
        try {
        po._setAttribute("foo", 3, false, "^");
        fail("Мала виникнути помилка про 'unsupported operation'");
        } catch (e) {
        expect(e.error).toMatch(/unsupported operation/);
        }
  });

  test("set/get <Name> creating _addAttribute()", () => {
    po._addAttribute("alpha", 1);
    expect(po.getAlpha()).toBe(1);
    po.setAlpha(2);
    expect(po.getAlpha()).toBe(2);
  });

  test("If using onChange callback", () => {
    const cb = jest.fn();
    po._addAttribute("beta", 10, undefined, cb);
    po.beta = 20;
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("toString() cuting values greater then 50", () => {
    const longString = "1234567890".repeat(6);
    po._addAttribute("longVal", longString);
    const rep = po.toString();
    expect(rep).not.toContain(longString);
    expect(rep).toContain("1234567890".repeat(5));
    expect(rep).toContain("~");
  });
});
