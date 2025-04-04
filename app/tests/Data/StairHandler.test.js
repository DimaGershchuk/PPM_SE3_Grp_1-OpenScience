import { StairHandler } from "../../../src/data/StairHandler.js";
import { TrialHandler } from "../../../src/data/TrialHandler.js";

describe("StairHandler", () => {
  let mockPsychoJS;

  beforeEach(() => {
    mockPsychoJS = {
      logger: {
        debug: jest.fn(),
        warn: jest.fn()
      },
      experiment: {
        addData: jest.fn()
      }
    };
    jest.clearAllMocks();
  });

  test("should initialize with correct default parameters", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 10,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05, 0.02],
      stepType: "LINEAR", // will be converted to Symbol.for("LINEAR")
      name: "TestStair",
      autoLog: false,
      fromMultiStair: false,
      extraArgs: { foo: "bar" }
    });

    // trialList is an array of length nTrials
    expect(handler.trialList.length).toBe(10);
    // _stairValue should be set to startVal
    expect(handler.getStairValue()).toBe(0.5);
    // intensity getter returns the same value
    expect(handler.intensity).toBe(0.5);
    // _data and _values arrays should be empty initially
    expect(handler._data).toEqual([]);
    expect(handler._values).toEqual([]);
    // Correct counter should be 0 initially
    expect(handler._correctCounter).toBe(0);
    // Current direction should be set to StairHandler.Direction.START
    expect(handler._currentDirection).toEqual(StairHandler.Direction.START);
  });

  test("addResponse should log data and update internal arrays on valid response", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 10,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05],
      stepType: "LINEAR",
      name: "TestStair",
      autoLog: false,
    });

    // Call addResponse with a valid response (1)
    handler.addResponse(1);
    // Check that experiment.addData was called with "TestStair.response" and 1
    expect(mockPsychoJS.experiment.addData).toHaveBeenCalledWith("TestStair.response", 1);
    // _data array should be updated with the response
    expect(handler._data.length).toBe(1);
    expect(handler._data[0]).toBe(1);
  });

  test("getStairValue and intensity getter should return current stair value", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 10,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05],
      stepType: "LINEAR",
      name: "TestStair",
      autoLog: false,
    });

    // Initially, getStairValue should return startVal (0.5)
    expect(handler.getStairValue()).toBe(0.5);
    expect(handler.intensity).toBe(0.5);
  });

  test("_increaseValue should increase stairValue correctly for LINEAR stepType", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 10,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05],
      stepType: "LINEAR",
      name: "TestStair",
      autoLog: false,
    });
    // Set correct counter to an arbitrary value
    handler._correctCounter = 2;
    const originalValue = handler._stairValue;
    handler._increaseValue();
    // For LINEAR, _increaseValue should add currentStepSize (0.05) to stairValue
    expect(handler._stairValue).toBeCloseTo(originalValue + 0.05);
    // Correct counter should reset to 0
    expect(handler._correctCounter).toBe(0);
  });

  test("_decreaseValue should decrease stairValue correctly for LINEAR stepType", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 10,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05],
      stepType: "LINEAR",
      name: "TestStair",
      autoLog: false,
    });
    const originalValue = handler._stairValue;
    handler._decreaseValue();
    expect(handler._stairValue).toBeCloseTo(originalValue - 0.05);
    expect(handler._correctCounter).toBe(0);
  });

  /*test("_updateTrialList should update trialList with current stairValue", () => {
    const handler = new StairHandler({
      psychoJS: mockPsychoJS,
      varName: "contrast",
      startVal: 0.5,
      minVal: 0.1,
      maxVal: 1.0,
      nTrials: 5,
      nReversals: 3,
      nUp: 1,
      nDown: 3,
      applyInitialRule: true,
      stepSizes: [0.05],
      stepType: "LINEAR",
      name: "TestStair",
      autoLog: false,
      fromMultiStair: false,
    });
    // Initially, trialList should be an array of 5 undefined elements
    expect(handler.trialList).toEqual(new Array(5).fill(undefined));
  
    // Create a dummy snapshot array for update
    handler._snapshots = [{ trialAttributes: [] }];
    // Set the current stair value to a new value (e.g., 0.55)
    handler._stairValue = 0.55;
    // Call _updateTrialList to update the first undefined element
    handler._updateTrialList();
    
    // Now, trialList[0] should be updated with an object containing { contrast: 0.55 }
    expect(handler.trialList[0]).toEqual({ contrast: 0.55 });
    // The snapshot should also be updated with the new value
    expect(handler._snapshots[0]["contrast"]).toBe(0.55);
    expect(handler._snapshots[0].trialAttributes).toContain("contrast");
  });*/
  
});
