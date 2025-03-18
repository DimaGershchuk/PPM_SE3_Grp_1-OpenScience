// EventEmitter.test.js
import { EventEmitter } from "../src/EventEmitter.js";


jest.mock("../../src/util/Util.js", () => {
  let counter = 0;
  return {
    makeUuid: () => `uuid-${++counter}`
  };
});

describe("EventEmitter", () => {
  let emitter;
  beforeEach(() => {
    emitter = new EventEmitter();
  });

  test("on() should registered user and returns uuid", () => {
    const listener = jest.fn();
    const uuid = emitter.on("test", listener);
    expect(typeof uuid).toBe("string");
    emitter.emit("test", { a: 1 });
    expect(listener).toHaveBeenCalledWith({ a: 1 });
  });

  test("emit() should call all listeners", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    emitter.on("update", listener1);
    emitter.on("update", listener2);
    emitter.emit("update", { b: 2 });
    expect(listener1).toHaveBeenCalledWith({ b: 2 });
    expect(listener2).toHaveBeenCalledWith({ b: 2 });
  });

  test("off() should delete listener", () => {
    const listener = jest.fn();
    const uuid = emitter.on("remove", listener);
    emitter.off("remove", uuid);
    emitter.emit("remove", { c: 3 });
    expect(listener).not.toHaveBeenCalled();
  });

  test("once() should call only once", () => {
    const listener = jest.fn();
    emitter.once("onceEvent", listener);
    emitter.emit("onceEvent", { d: 4 });
    emitter.emit("onceEvent", { d: 5 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("on() should throw error, if listener not a fucntion", () => {
    expect(() => emitter.on("fail", "notAFunction")).toThrow(TypeError);
  });

  test("emit() returns false, if no listeners there", () => {
    expect(emitter.emit("nonexistent", {})).toBe(false);
  });
});
