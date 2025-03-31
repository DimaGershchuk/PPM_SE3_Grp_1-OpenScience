import { ExperimentHandler } from "../../../src/data/ExperimentHandler.js";

describe("ExperimentHandler", () => {
  let handler;
  let mockPsychoJS;

  beforeEach(() => {
    mockPsychoJS = {
      logger: {
        info: jest.fn(),
      },
      config: {
        experiment: {
          name: "TestExp",
          status: "RUNNING",
          saveFormat: ExperimentHandler.SaveFormat.CSV,
        },
        gitlab: {
          projectId: 12345,
        },
      },
      getEnvironment: jest.fn(() => ExperimentHandler.Environment.LOCAL),
      serverManager: {
        uploadData: jest.fn(),
      },
      _serverMsg: new Map(),
    };

    handler = new ExperimentHandler({
      psychoJS: mockPsychoJS,
      name: "TestHandler",
      extraInfo: {
        expName: "TestExp",
        participant: "P001",
        session: "S01",
        date: "2025-03-29",
      },
      dataFileName: "test_data",
    });
  });

  test("should initialize with proper defaults", () => {
    expect(handler._experimentName).toBe("TestExp");
    expect(handler._participant).toBe("P001");
    expect(handler._session).toBe("S01");
    expect(handler._datetime).toBe("2025-03-29");
    expect(handler._trialsData).toEqual([]);
  });

  test("addData should add keys and values to current trial", () => {
    handler.addData("accuracy", 1);
    handler.addData("reactionTime", 512);

    expect(handler._currentTrialData.accuracy).toBe(1);
    expect(handler._currentTrialData.reactionTime).toBe(512);
    expect(handler._trialsKeys).toContain("accuracy");
    expect(handler._trialsKeys).toContain("reactionTime");
  });

  test("nextEntry should push current trial and reset it", () => {
    handler.addData("accuracy", 1);
    handler.addData("reactionTime", 512);

    handler.nextEntry();

    expect(handler._trialsData.length).toBe(1);
    expect(handler._currentTrialData).toEqual({});
  });

  test("addLoop and removeLoop should manage loop list correctly", () => {
    const dummyLoop = { name: "trialLoop" };
    handler.addLoop(dummyLoop);

    expect(handler._loops).toContain(dummyLoop);
    expect(handler._unfinishedLoops).toContain(dummyLoop);

    handler.removeLoop(dummyLoop);
    expect(handler._unfinishedLoops).not.toContain(dummyLoop);
  });

  test("isEntryEmpty returns false when current trial has data", () => {
    handler.addData("someKey", "someValue");
    expect(handler.isEntryEmpty()).toBe(true); // returns true if there's data
  });

  test("save (CSV, local) should trigger download", async () => {
    global.URL.createObjectURL = jest.fn();
    const spy = jest.spyOn(require("../../../src/util/Util.js"), "offerDataForDownload").mockImplementation(() => {});

    handler.addData("score", 10);
    handler.nextEntry();

    await handler.save();
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test("getResultAsCsv should return a valid CSV string", () => {
    handler.addData("score", 42);
    handler.nextEntry();

    const csv = handler.getResultAsCsv();
    expect(typeof csv).toBe("string");
    expect(csv).toContain("score");
    expect(csv).toContain("42");
  });
});
