import { Window } from '../../../src/core/Window.js';
import { PsychoJS } from '../../../src/core/PsychoJS.js';

// We will create a dummy (mock) object for PsychoJS
describe("Window class", () => {
  let dummyPsychoJS;
  let winInstance;

  beforeEach(() => {
    // Create a dummy PsychoJS with the minimal properties required for testing.
    dummyPsychoJS = {
      logger: {
        debug: jest.fn(),
        warn: jest.fn(),
      },
      scheduler: {
        _lastDelta: 0,
      },
      config: {
        experiment: {
          fullpath: "dummy/path",
          status: "RUNNING",
        },
      },
      eventManager: {
        addMouseListeners: jest.fn(),
      },
    };

    // Create a Window instance, passing the dummyPsychoJS and other necessary parameters.
    // For simplicity, the color object is defined with int and hex properties.
    winInstance = new Window({
      psychoJS: dummyPsychoJS,
      name: "TestWindow",
      fullscr: false,
      color: { int: 0x000000, hex: "#000000" },
      autoLog: false,
    });

    // Mock the _setupPixi method to prevent real DOM operations during testing.
    winInstance._setupPixi = jest.fn();
  });

  test("getActualFrameRate returns 60 if _lastDelta is 0", () => {
    // If the last delta time is 0, the method should return 60.0.
    dummyPsychoJS.scheduler._lastDelta = 0;
    expect(winInstance.getActualFrameRate()).toBe(60.0);
  });

  test("getActualFrameRate calculates fps correctly when _lastDelta is non-zero", () => {
    // For _lastDelta = 20 ms, we expect fps = 1000 / 20 = 50.
    dummyPsychoJS.scheduler._lastDelta = 20;
    expect(winInstance.getActualFrameRate()).toBeCloseTo(50);
  });

  test("logOnFlip should store messages for the next flip", () => {
    // Check that the logOnFlip method adds messages to _msgToBeLogged.
    expect(winInstance._msgToBeLogged).toEqual([]);
    winInstance.logOnFlip({ msg: "Test message", level: Symbol.for("DEBUG"), obj: {} });
    expect(winInstance._msgToBeLogged.length).toBe(1);
    expect(winInstance._msgToBeLogged[0].msg).toBe("Test message");
  });

  test("callOnFlip should add a callback", () => {
    // Check that callOnFlip adds a callback function with arguments to _flipCallbacks.
    const mockCallback = jest.fn();
    winInstance.callOnFlip(mockCallback, 1, 2, 3);
    expect(winInstance._flipCallbacks.length).toBe(1);
    expect(winInstance._flipCallbacks[0]).toEqual({
      function: mockCallback,
      arguments: [1, 2, 3],
    });
  });

  test("render should call flip callbacks and clear _flipCallbacks", () => {
    // For testing render(), we create a dummy _renderer and _rootContainer,
    // and we set up multiple flip callbacks.
    winInstance._renderer = {
      render: jest.fn(),
      gl: {
        readPixels: jest.fn(),
        finish: jest.fn(),
      },
    };
    winInstance._rootContainer = {};
    // Fill _flipCallbacks with a few mocks.
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    winInstance._flipCallbacks = [
      { function: callback1, arguments: [] },
      { function: callback2, arguments: [42] },
    ];
    // Mock logging and refresh methods.
    winInstance._writeLogOnFlip = jest.fn();
    winInstance._refresh = jest.fn();

    winInstance.render();

    // Check that _flipCallbacks is cleared after render.
    expect(winInstance._flipCallbacks.length).toBe(0);
    // And that each callback was called:
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith(42);
  });
});
