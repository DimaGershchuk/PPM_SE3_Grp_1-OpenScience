// EventEmitter.test.js
import { EventEmitter } from "../../../src/util/EventEmitter.js";

// Mock the UUID generator to produce predictable IDs
jest.mock("../../../src/util/Util.js", () => {
  let counter = 0;
  return {
    makeUuid: () => `uuid-${++counter}`
  };
});

describe("EventEmitter", () => {
  let emitter;

  // Create a fresh emitter before each test
  beforeEach(() => {
    emitter = new EventEmitter();
  });

  test("on() should register a listener and return its UUID", () => {
    const listener = jest.fn();
    // Subscribe a listener to the "test" event
    const uuid = emitter.on("test", listener);
    expect(typeof uuid).toBe("string");            // UUID should be a string
    // Emit the event and verify the listener is invoked with correct data
    emitter.emit("test", { a: 1 });
    expect(listener).toHaveBeenCalledWith({ a: 1 });
  });

  test("emit() should call all listeners for an event", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    // Register two listeners on the same event
    emitter.on("update", listener1);
    emitter.on("update", listener2);
    // Emit once and expect both listeners to fire
    emitter.emit("update", { b: 2 });
    expect(listener1).toHaveBeenCalledWith({ b: 2 });
    expect(listener2).toHaveBeenCalledWith({ b: 2 });
  });

  test("off() should remove a specific listener by UUID", () => {
    const listener = jest.fn();
    // Subscribe and immediately unsubscribe
    const uuid = emitter.on("remove", listener);
    emitter.off("remove", uuid);
    // Emitting afterwards should not call the removed listener
    emitter.emit("remove", { c: 3 });
    expect(listener).not.toHaveBeenCalled();
  });

  test("once() should invoke the listener only on the first emit", () => {
    const listener = jest.fn();
    // Subscribe with once()
    emitter.once("onceEvent", listener);
    emitter.emit("onceEvent", { d: 4 });
    emitter.emit("onceEvent", { d: 5 });
    // Listener should have been called only once
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("on() should throw TypeError if listener is not a function", () => {
    // Passing a non-function should cause an immediate error
    expect(() => emitter.on("fail", "notAFunction")).toThrow(TypeError);
  });

  test("emit() returns false if no listeners are registered", () => {
    // Emitting an unregistered event should return false
    expect(emitter.emit("nonexistent", {})).toBe(false);
  });
});
