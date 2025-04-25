// PsychObject.test.js

import { PsychObject } from "../../../src/util/PsychObject.js";

// Mock logger class that captures warning calls
class MockLogger {
  warn = jest.fn();
}

// Mock PsychoJS with only a logger property
class MockPsychoJS {
  constructor() {
    this.logger = new MockLogger();
  }
}

describe("PsychObject", () => {
  let mockPsychoJS;
  let po;

  // Before each test, instantiate a fresh PsychObject with a mock PsychoJS
  beforeEach(() => {
    mockPsychoJS = new MockPsychoJS();
    po = new PsychObject(mockPsychoJS);
  });

  test("Initialization: should store psychoJS reference and default name/userAttributes", () => {
    // The internal reference to psychoJS
    expect(po.psychoJS).toBe(mockPsychoJS);
    // _userAttributes should be initialized as an empty Set
    expect(po._userAttributes).toBeInstanceOf(Set);
    // Default name should match the class name
    expect(po.name).toBe("PsychObject");
  });

  test("toString() should include class name and attributes", () => {
    const str = po.toString();
    // Should start with "PsychObject("
    expect(str).toContain("PsychObject(");
    // Should list the default 'name' attribute
    expect(str).toContain("name=PsychObject");
  });

  test("_addAttribute() creates public getters/setters and registers attribute", () => {
    // Dynamically add attribute 'foo' with initial value 123
    po._addAttribute("foo", 123);
    // Getter should return initial value
    expect(po.foo).toBe(123);
    // Setter should update the value
    po.foo = 456;
    expect(po.foo).toBe(456);
    // _userAttributes should include the new property
    expect(po._userAttributes.has("foo")).toBe(true);
  });

  test("_setAttribute() supports element-wise addition for arrays", () => {
    po._addAttribute("positions", [1, 2, 3]);
    // Add [10,20,30] to positions
    po._setAttribute("positions", [10, 20, 30], false, "+");
    expect(po.positions).toEqual([11, 22, 33]);
  });

  test("_setAttribute() supports scalar multiplication for array attributes", () => {
    po._addAttribute("scale", [2, 4]);
    // Multiply each element by 5
    po._setAttribute("scale", 5, false, "*");
    expect(po.scale).toEqual([10, 20]);
  });

  test("_setAttribute() supports scalar addition", () => {
    po._addAttribute("value", 10);
    // Add 3 to the scalar
    po._setAttribute("value", 3, false, "+");
    expect(po.value).toBe(13);
  });

  test("_setAttribute() warns and clears value when setting to undefined", () => {
    po._addAttribute("testAttr", 999);
    // Setting to undefined should trigger a warning and clear the property
    po._setAttribute("testAttr", undefined);
    expect(mockPsychoJS.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("undefined")
    );
    expect(po.testAttr).toBeUndefined();
  });

  test("_setAttribute() returns true when the value actually changes", () => {
    po._addAttribute("someAttr", 100);
    // Change from 100 to 200
    const changed = po._setAttribute("someAttr", 200);
    expect(changed).toBe(true);
    expect(po.someAttr).toBe(200);
  });

  test("_setAttribute() returns false when the new value equals the old", () => {
    po._addAttribute("unchanged", "hello");
    // Setting to the same string should not be considered a change
    const changed = po._setAttribute("unchanged", "hello");
    expect(changed).toBe(false);
  });

  test("_setAttribute() throws error for mismatched array lengths on element-wise ops", () => {
    expect.assertions(1);
    po._addAttribute("arrayAttr", [1, 2]);
    try {
      // Attempt to add a longer array triggers an error
      po._setAttribute("arrayAttr", [10, 20, 30], false, "+");
      fail("Expected size mismatch error");
    } catch (e) {
      expect(e.error).toMatch(/should have the same size/);
    }
  });

  test("_setAttribute() throws on unsupported operation symbol", () => {
    expect.assertions(1);
    po._addAttribute("foo", 2);
    try {
      // '^' is not a supported operation
      po._setAttribute("foo", 3, false, "^");
      fail("Expected unsupported operation error");
    } catch (e) {
      expect(e.error).toMatch(/unsupported.*operation/);
    }
  });

  test("Generated getters/setters: get<Attr>() and set<Attr>() work correctly", () => {
    // _addAttribute should define getAlpha and setAlpha
    po._addAttribute("alpha", 1);
    expect(po.getAlpha()).toBe(1);
    po.setAlpha(2);
    expect(po.getAlpha()).toBe(2);
  });

  test("onChange callback is invoked when attribute value changes", () => {
    const cb = jest.fn();
    // Provide onChange callback argument to _addAttribute
    po._addAttribute("beta", 10, undefined, cb);
    // Assignment should trigger callback
    po.beta = 20;
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("toString() truncates long attribute values and appends '~'", () => {
    // Create a long string >50 characters
    const longString = "1234567890".repeat(6);
    po._addAttribute("longVal", longString);
    const rep = po.toString();
    // Should not include the full long string...
    expect(rep).not.toContain(longString);
    // ...but include a truncated portion (first 50 chars) and a '~' indicator
    expect(rep).toContain("1234567890".repeat(5));
    expect(rep).toContain("~");
  });
});
