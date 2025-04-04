import { MultiStairHandler } from "../../../src/data/MultiStairHandler.js";
import { TrialHandler } from "../../../src/data/TrialHandler.js";

// Mock QuestHandler with prototype setup
jest.mock("../../../src/data/QuestHandler.js", () => {
  const realModule = jest.requireActual("../../../src/data/QuestHandler.js");
  const RealQuest = realModule.QuestHandler;
  return {
    QuestHandler: jest.fn().mockImplementation((args) => {
      const mockQ = {
        _name: args.name,
        finished: false,
        _userAttributes: ["name", "startVal", "startValSd"],
        _extraArgs: {},
        addResponse: jest.fn(),
        getQuestValue: jest.fn().mockReturnValue(0.5),
      };
      Object.setPrototypeOf(mockQ, RealQuest.prototype);
      return mockQ;
    }),
  };
});

// Mock StairHandler with prototype setup
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
        addResponse: jest.fn(),
        getStairValue: jest.fn().mockReturnValue(0.3),
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
    mockPsychoJS = {
      logger: {
        debug: jest.fn(),
        warn: jest.fn(),
      },
      experiment: {
        addData: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  test("should inherit from TrialHandler", () => {
    // Pass at least a non-empty conditions array and a name
    const msh = new MultiStairHandler({
      psychoJS: mockPsychoJS,
      name: "MultiStairHandler",
      conditions: [{ startVal: 0.5, label: "S1" }], // simple
    });
    expect(msh).toBeInstanceOf(TrialHandler);
  });

 /* test("should throw if conditions invalid (missing startValSd for QUEST)", () => {
    try {
      new MultiStairHandler({
        psychoJS: mockPsychoJS,
        name: "MultiStairHandler",
        stairType: MultiStairHandler.StaircaseType.QUEST,
        // Missing startValSd
        conditions: [{ startVal: 0.5, label: "Q1" }],
      });
      fail("Expected error for missing startValSd");
    } catch (err) {
      expect(err.error).toContain("QUEST conditions must include a startValSd field");
    }
  });*/

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
    // _prepareStaircases should create 2 StairHandlers
    expect(StairHandler).toHaveBeenCalledTimes(2);
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
    // Log the response in the experiment as "MultiStairHandler.response"
    expect(mockPsychoJS.experiment.addData).toHaveBeenCalledWith(
      "MultiStairHandler.response",
      1
    );
    // Forward the response to the current staircase with doAddData=false
    expect(firstStaircase.addResponse).toHaveBeenCalledWith(1, undefined, false);
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
    // Mock two StairHandlers that finish after one response
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
    expect(msh._finished).toBe(false);
    msh.addResponse(1); // first staircase finishes
    expect(msh._finished).toBe(false);
    msh.addResponse(0); // second staircase finishes => no active staircases remain
    expect(msh._finished).toBe(true);
  });
});
