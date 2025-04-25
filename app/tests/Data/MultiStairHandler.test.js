import { MultiStairHandler } from "../../../src/data/MultiStairHandler.js";
import { TrialHandler } from "../../../src/data/TrialHandler.js";

// Mock QuestHandler so we can intercept its instantiation and methods
jest.mock("../../../src/data/QuestHandler.js", () => {
  const realModule = jest.requireActual("../../../src/data/QuestHandler.js");
  const RealQuest = realModule.QuestHandler;
  return {
    QuestHandler: jest.fn().mockImplementation((args) => {
      // Create a minimal mock that still inherits QuestHandler's prototype
      const mockQ = {
        _name: args.name,
        finished: false,
        _userAttributes: ["name", "startVal", "startValSd"],
        _extraArgs: {},
        addResponse: jest.fn(),                   // spy on addResponse calls
        getQuestValue: jest.fn().mockReturnValue(0.5),  // fixed intensity
      };
      Object.setPrototypeOf(mockQ, RealQuest.prototype);
      return mockQ;
    }),
  };
});

// Mock StairHandler similarly
jest.mock("../../../src/data/StairHandler.js", () => {
  const realModule = jest.requireActual("../../../src/data/StairHandler.js");
  const RealStair = realModule.StairHandler;
  return {
    StairHandler: jest.fn().mockImplementation((args) => {
      const mockStair = {
        _name: args.name,
        finished: false,
        _userAttributes: ["name", "startVal", "nUp"],
        _extraArgs: {},
        addResponse: jest.fn(),                   // spy on addResponse
        getStairValue: jest.fn().mockReturnValue(0.3), // fixed intensity
      };
      Object.setPrototypeOf(mockStair, RealStair.prototype);
      return mockStair;
    }),
  };
});

import { QuestHandler } from "../../../src/data/QuestHandler.js";
import { StairHandler } from "../../../src/data/StairHandler.js";

describe("MultiStairHandler", () => {
  let mockPsychoJS;

  beforeEach(() => {
    // Provide a fake psychoJS with logger and experiment hooks
    mockPsychoJS = {
      logger: {
        debug: jest.fn(),
        warn: jest.fn(),
      },
      experiment: {
        addData: jest.fn(),
      },
    };
    jest.clearAllMocks();  // reset call counts on mocks
  });

  test("should inherit from TrialHandler", () => {
    // Create with at least one simple staircase condition
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      conditions: [{ startVal: 0.5, label: "S1" }],
    });
    // Expect prototype chain to include TrialHandler
    expect(msh).toBeInstanceOf(TrialHandler);
  });

  test("should create multiple StairHandlers if stairType=SIMPLE", () => {
    const conditions = [
      { startVal: 0.2, label: "S1", nUp: 1 },
      { startVal: 0.5, label: "S2", nUp: 2 },
    ];
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      stairType: MultiStairHandler.StaircaseType.SIMPLE,
      conditions,
      nTrials: 3,
    });
    // The constructor should have invoked StairHandler twice
    expect(StairHandler).toHaveBeenCalledTimes(2);
    // And the first currentStaircase should be set
    expect(msh._currentStaircase).toBeDefined();
  });

  test("addResponse should forward the response to the current staircase, then call _nextTrial", () => {
    const conditions = [
      { startVal: 0.4, startValSd: 0.1, label: "Q1" },
      { startVal: 0.5, startValSd: 0.1, label: "Q2" },
    ];
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      stairType: MultiStairHandler.StaircaseType.QUEST,
      conditions,
      method: TrialHandler.Method.SEQUENTIAL,
      nTrials: 2,
    });

    const firstStaircase = msh._currentStaircase;
    msh.addResponse(1);

    // Verify that experiment.addData was called with the correct key
    expect(mockPsychoJS.experiment.addData).toHaveBeenCalledWith(
      "MultiStairHandler.response",
      1
    );

    // Verify that the response was forwarded to the QuestHandler mock
    expect(firstStaircase.addResponse).toHaveBeenCalledWith(1, undefined, false);

    // After calling addResponse, currentStaircase should advance
    const secondStaircase = msh._currentStaircase;
    expect(secondStaircase).not.toBe(firstStaircase);
  });

  test("addResponse should throw if response is not 0 or 1", () => {
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      stairType: MultiStairHandler.StaircaseType.SIMPLE,
      conditions: [{ startVal: 0.2, label: "S1" }],
      nTrials: 1,
    });

    // Passing an invalid response should throw a descriptive error
    try {
      msh.addResponse(2);
      fail("Expected error for invalid response");
    } catch (err) {
      expect(err.error).toContain("the response must be either 0 or 1");
    }

    try {
      msh.addResponse(-1);
      fail("Expected error for invalid response");
    } catch (err) {
      expect(err.error).toContain("the response must be either 0 or 1");
    }
  });

  test("should finish when no active staircases left (all finished)", () => {
    // Override the two StairHandler mocks to finish on first addResponse
    StairHandler.mockImplementationOnce(function (args) {
      this._name = args.name;
      this.finished = false;
      this._userAttributes = ["name"];
      this._extraArgs = {};
      this.addResponse = function () { this.finished = true; };
      this.getStairValue = jest.fn().mockReturnValue(0.3);
    });
    StairHandler.mockImplementationOnce(function (args) {
      this._name = args.name;
      this.finished = false;
      this._userAttributes = ["name"];
      this._extraArgs = {};
      this.addResponse = function () { this.finished = true; };
      this.getStairValue = jest.fn().mockReturnValue(0.6);
    });

    const conditions = [
      { startVal: 0.2, label: "S1" },
      { startVal: 0.5, label: "S2" },
    ];
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      stairType: MultiStairHandler.StaircaseType.SIMPLE,
      conditions,
      method: TrialHandler.Method.SEQUENTIAL,
      nTrials: 3,
    });

    // Initially, handler should not be marked finished
    expect(msh._finished).toBe(false);

    // First response finishes the first staircase
    msh.addResponse(1);
    expect(msh._finished).toBe(false);

    // Second response finishes the second staircase, no more active staircases => _finished true
    msh.addResponse(0);
    expect(msh._finished).toBe(true);
  });
});
