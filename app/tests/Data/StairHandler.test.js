import { StairHandler } from "../../../src/data/StairHandler.js";
import { TrialHandler } from "../../../src/data/TrialHandler.js";

describe("StairHandler", () => {
  let mockPsychoJS;

  beforeEach(() => {
    // Create a fake PsychoJS object with logger and experiment hooks
    mockPsychoJS = {
      logger: {
        debug: jest.fn(), // spy on debug logs
        warn: jest.fn()   // spy on warning logs
      },
      experiment: {
        addData: jest.fn() // spy on data logging calls
      }
    };
    jest.clearAllMocks(); // reset all mock call counts
  });

  test("should initialize with correct default parameters", () => {
    // Instantiate with full options to verify attributes and initial state
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
      stepType: "LINEAR", // will be converted internally to Symbol.for("LINEAR")
      name: "TestStair",
      autoLog: false,
      fromMultiStair: false,
      extraArgs: { foo: "bar" }
    });

    // trialList length should match nTrials
    expect(handler.trialList.length).toBe(10);

    // Initial stair value should equal startVal
    expect(handler.getStairValue()).toBe(0.5);

    // intensity property should mirror getStairValue()
    expect(handler.intensity).toBe(0.5);

    // No responses or values stored yet
    expect(handler._data).toEqual([]);
    expect(handler._values).toEqual([]);

    // Correct response counter starts at 0
    expect(handler._correctCounter).toBe(0);

    // Initial direction should be the START symbol
    expect(handler._currentDirection).toEqual(StairHandler.Direction.START);
  });

  test("addResponse should log data and update internal arrays on valid response", () => {
    // Create a handler with default single step configuration
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

    // Call addResponse with a correct response (1)
    handler.addResponse(1);

    // Expect experiment.addData to log the response under "TestStair.response"
    expect(mockPsychoJS.experiment.addData).toHaveBeenCalledWith("TestStair.response", 1);

    // The internal _data array should now contain the single response
    expect(handler._data.length).toBe(1);
    expect(handler._data[0]).toBe(1);
  });

  test("getStairValue and intensity getter should return current stair value", () => {
    // Verify getStairValue() and intensity before any responses
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

    // Should match the initial value from constructor
    expect(handler.getStairValue()).toBe(0.5);
    expect(handler.intensity).toBe(0.5);
  });

  test("_increaseValue should increase stairValue correctly for LINEAR stepType", () => {
    // Test the private method _increaseValue for linear stepping
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

    // Simulate multiple correct responses (though _correctCounter not used here)
    handler._correctCounter = 2;
    const originalValue = handler._stairValue;
    handler._increaseValue();

    // Expect stairValue to increase by the single step size
    expect(handler._stairValue).toBeCloseTo(originalValue + 0.05);

    // Correct counter should reset after stepping
    expect(handler._correctCounter).toBe(0);
  });

  test("_decreaseValue should decrease stairValue correctly for LINEAR stepType", () => {
    // Test the private method _decreaseValue for linear stepping
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

    // Expect stairValue to decrease by the step size
    expect(handler._stairValue).toBeCloseTo(originalValue - 0.05);

    // Correct counter resets after a decrease
    expect(handler._correctCounter).toBe(0);
  });

  /*
  test("_updateTrialList should update trialList with current stairValue", () => {
    // This test covers the _updateTrialList method when not used in MultiStairHandler
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

    // Initially, trialList entries are undefined
    expect(handler.trialList).toEqual(new Array(5).fill(undefined));

    // Prepare a dummy snapshot to allow snapshot update
    handler._snapshots = [{ trialAttributes: [] }];

    // Change the stair value
    handler._stairValue = 0.55;
    handler._updateTrialList();

    // The first element of trialList should now reflect the stairValue
    expect(handler.trialList[0]).toEqual({ contrast: 0.55 });

    // The snapshot should record the updated value and attribute name
    expect(handler._snapshots[0]["contrast"]).toBe(0.55);
    expect(handler._snapshots[0].trialAttributes).toContain("contrast");
  });
  */
});
