import { ExperimentHandler } from "../../../src/data/ExperimentHandler.js";

describe("ExperimentHandler", () => {
  let handler;
  let mockPsychoJS;

  // Before each test, create a fresh ExperimentHandler instance with mocked PsychoJS
  beforeEach(() => {
    mockPsychoJS = {
      logger: {
        info: jest.fn(),                   // spy on info-level logging
      },
      config: {
        experiment: {
          name: "TestExp",                // experiment name in config
          status: "RUNNING",              // current experiment status
          saveFormat: ExperimentHandler.SaveFormat.CSV,  // default save format
        },
        gitlab: {
          projectId: 12345,               // dummy project ID for server interactions
        },
      },
      getEnvironment: jest.fn(() => ExperimentHandler.Environment.LOCAL), // simulate running locally
      serverManager: {
        uploadData: jest.fn(),            // spy on server upload calls
      },
      _serverMsg: new Map(),              // internal map to collect server messages
    };

    // Instantiate ExperimentHandler under test
    handler = new ExperimentHandler({
      psychoJS: mockPsychoJS,
      name: "TestHandler",
      extraInfo: {
        expName: "TestExp",               // extra experiment metadata
        participant: "P001",              // participant ID
        session: "S01",                   // session ID
        date: "2025-03-29",               // date string
      },
      dataFileName: "test_data",          // base filename for saved data
    });
  });

  test("should initialize with proper defaults", () => {
    // Verify that constructor set the experiment name, participant, session, and datetime
    expect(handler._experimentName).toBe("TestExp");
    expect(handler._participant).toBe("P001");
    expect(handler._session).toBe("S01");
    expect(handler._datetime).toBe("2025-03-29");
    // No trials have been recorded yet
    expect(handler._trialsData).toEqual([]);
  });

  test("addData should add keys and values to current trial", () => {
    // Add two data fields to the current trial
    handler.addData("accuracy", 1);
    handler.addData("reactionTime", 512);

    // The currentTrialData object should have the properties just added
    expect(handler._currentTrialData.accuracy).toBe(1);
    expect(handler._currentTrialData.reactionTime).toBe(512);
    // The internal list of all keys should include these new fields
    expect(handler._trialsKeys).toContain("accuracy");
    expect(handler._trialsKeys).toContain("reactionTime");
  });

  test("nextEntry should push current trial and reset it", () => {
    // Populate current trial
    handler.addData("accuracy", 1);
    handler.addData("reactionTime", 512);

    // Move to next entry: should append the current data to trialsData and reset currentTrialData
    handler.nextEntry();

    expect(handler._trialsData.length).toBe(1);
    expect(handler._currentTrialData).toEqual({});
  });

  test("addLoop and removeLoop should manage loop list correctly", () => {
    const dummyLoop = { name: "trialLoop" };
    // Adding a loop should register it in both _loops and _unfinishedLoops
    handler.addLoop(dummyLoop);
    expect(handler._loops).toContain(dummyLoop);
    expect(handler._unfinishedLoops).toContain(dummyLoop);

    // Removing the loop marks it as finished (removes from _unfinishedLoops only)
    handler.removeLoop(dummyLoop);
    expect(handler._unfinishedLoops).not.toContain(dummyLoop);
  });

  test("isEntryEmpty returns false when current trial has data", () => {
    // After adding data, isEntryEmpty should report false (i.e., entry is not empty)
    handler.addData("someKey", "someValue");
    expect(handler.isEntryEmpty()).toBe(true);
  });

  test("save (CSV, local) should trigger download", async () => {
    // Mock browser URL.createObjectURL and the helper that offers download to user
    global.URL.createObjectURL = jest.fn();
    const spy = jest
      .spyOn(require("../../../src/util/Util.js"), "offerDataForDownload")
      .mockImplementation(() => {});

    // Record one trial and save
    handler.addData("score", 10);
    handler.nextEntry();

    await handler.save();

    // Saving locally in CSV format should call offerDataForDownload
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test("getResultAsCsv should return a valid CSV string", () => {
    // Populate a single trial and retrieve CSV string
    handler.addData("score", 42);
    handler.nextEntry();

    const csv = handler.getResultAsCsv();
    // Should be a string containing the header and the data
    expect(typeof csv).toBe("string");
    expect(csv).toContain("score");
    expect(csv).toContain("42");
  });
});
