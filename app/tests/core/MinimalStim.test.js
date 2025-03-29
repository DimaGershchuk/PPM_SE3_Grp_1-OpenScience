import { MinimalStim } from "../../../src/core/MinimalStim.js";
import { PsychoJS } from "../../../src/core/PsychoJS.js";

// Create a subclass to implement abstract methods for testing.
class TestStim extends MinimalStim {
  constructor(options) {
    super(options);
  }
  
  // Implement abstract method 'contains'
  contains(object, units) {
    return false;
  }
  
  // Implement _updateIfNeeded to simply set a dummy _pixi if not defined.
  _updateIfNeeded() {
    if (typeof this._pixi === "undefined") {
      this._pixi = { dummy: true, destroy: jest.fn() };
    }
    this._needUpdate = false;
  }
}

describe("MinimalStim", () => {
  let dummyPsychoJS;
  let dummyWin;
  let stim;

  beforeEach(() => {
    // Create a dummy PsychoJS with Status constants.
    dummyPsychoJS = {
      logger: {
        warn: jest.fn(),
        info: jest.fn(),
      },
      Status: {
        NOT_STARTED: Symbol.for("NOT_STARTED"),
        STARTED: Symbol.for("STARTED"),
        STOPPED: Symbol.for("STOPPED"),
        FINISHED: Symbol.for("FINISHED"),
      },
      experimentLogger: { data: jest.fn() }
    };

    // Create a dummy Window with the needed methods and properties.
    dummyWin = {
      _psychoJS: dummyPsychoJS,
      autoLog: true,
      _drawList: [],
      addPixiObject: jest.fn(),
      removePixiObject: jest.fn(),
    };

    // Create a TestStim instance with provided options.
    stim = new TestStim({
      name: "TestStim",
      win: dummyWin,
      autoDraw: false,
      autoLog: false
    });
  });

  test("should initialize with correct default attributes", () => {
    expect(stim.name).toBe("TestStim");
    expect(stim.win).toBe(dummyWin);
    expect(stim.autoDraw).toBe(false);
    expect(stim.autoLog).toBe(false);
    expect(stim.status).toBe(dummyPsychoJS.Status.NOT_STARTED);
  });

  test("setAutoDraw(true) should call draw()", () => {
    // Spy on draw() and hide()
    stim.draw = jest.fn();
    stim.hide = jest.fn();
    stim.setAutoDraw(true);
    expect(stim.draw).toHaveBeenCalled();
    expect(stim.hide).not.toHaveBeenCalled();
  });

  test("setAutoDraw(false) should call hide()", () => {
    stim.draw = jest.fn();
    stim.hide = jest.fn();
    stim.setAutoDraw(false);
    expect(stim.hide).toHaveBeenCalled();
    expect(stim.draw).not.toHaveBeenCalled();
  });

  test("draw() should add stimulus to window if not already present", () => {
    // Ensure the draw list is initially empty.
    dummyWin._drawList = [];
    stim._pixi = undefined;
    stim.draw();
    // _updateIfNeeded should have set _pixi to a dummy object.
    expect(stim._pixi).toBeDefined();
    // Window's addPixiObject should be called with _pixi.
    expect(dummyWin.addPixiObject).toHaveBeenCalledWith(stim._pixi);
    // The stimulus should be added to the draw list.
    expect(dummyWin._drawList).toContain(stim);
    // Status should be set to STARTED.
    expect(stim.status).toBe(dummyPsychoJS.Status.STARTED);
  });

  test("draw() should update stimulus if already in draw list and _needUpdate is true", () => {
    // Place the stimulus in the draw list.
    dummyWin._drawList = [stim];
    // Set _pixi to a dummy object and _needUpdate to true.
    stim._pixi = { dummy: true, destroy: jest.fn() };
    stim._needUpdate = true;
    // Spy on _updateIfNeeded and window methods.
    const updateSpy = jest.spyOn(stim, "_updateIfNeeded");
    dummyWin.removePixiObject = jest.fn();
    dummyWin.addPixiObject = jest.fn();
    stim.draw();
    // Should remove the old pixi object.
    expect(dummyWin.removePixiObject).toHaveBeenCalledWith(stim._pixi);
    // Should call _updateIfNeeded.
    expect(updateSpy).toHaveBeenCalled();
    // And add the pixi object again.
    expect(dummyWin.addPixiObject).toHaveBeenCalledWith(stim._pixi);
  });

  test("hide() should remove stimulus from window", () => {
    // Place the stimulus in the draw list.
    dummyWin._drawList = [stim];
    stim._pixi = { dummy: true };
    dummyWin.removePixiObject = jest.fn();
    stim.hide();
    // The stimulus should be removed from the draw list.
    expect(dummyWin._drawList).not.toContain(stim);
    // Window's removePixiObject should be called with _pixi.
    expect(dummyWin.removePixiObject).toHaveBeenCalledWith(stim._pixi);
    // Status should be set to STOPPED.
    expect(stim.status).toBe(dummyPsychoJS.Status.FINISHED);
  });

  test("release() should set autoDraw to false, set status to STOPPED, and destroy _pixi", () => {
    // Set a dummy _pixi with a destroy method.
    const destroySpy = jest.fn();
    stim._pixi = { dummy: true, destroy: destroySpy };
    // Spy on _setAttribute.
    const setAttrSpy = jest.spyOn(stim, "_setAttribute");
    stim.release();
    expect(setAttrSpy).toHaveBeenCalledWith("autoDraw", false, false);
    expect(stim.status).toBe(dummyPsychoJS.Status.FINISHED);
    expect(destroySpy).toHaveBeenCalledWith(true);
    expect(stim._pixi).toBeUndefined();
  });

  test("contains() should throw an error because it's abstract", () => {
    // Create an instance of MinimalStim directly.
    expect(() => {
      const minimalStim = new MinimalStim({ name: "AbstractTest", win: dummyWin });
      minimalStim.contains({});
    }).toThrow();
  });

  test("_updateIfNeeded() should throw an error because it's abstract", () => {
    expect(() => {
      const minimalStim = new MinimalStim({ name: "AbstractTest", win: dummyWin });
      minimalStim._updateIfNeeded();
    }).toThrow();
  });
});