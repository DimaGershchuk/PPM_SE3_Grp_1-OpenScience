// Import the class under test and any dependencies
import { TrialHandler } from "../../../src/data/TrialHandler.js";
import "../setup.js";  // global setup if needed (e.g. polyfills)

/**
 * Mock for serverManager to simulate resource loading in importConditions.
 */
const mockServerManager = {
  getResource: jest.fn(),
};

/**
 * Minimal PsychoJS mock to satisfy TrialHandler dependencies.
 */
const mockPsychoJS = {
  serverManager: mockServerManager,
  logger: {
    warn: jest.fn(),
    debug: jest.fn(),
  },
};

describe("TrialHandler", () => {

  beforeEach(() => {
    // Reset all mock call counts before each test
    jest.clearAllMocks();
  });

  test("constructor should handle default trialList=[undefined]", () => {
    // Instantiate with no explicit trialList => defaults to [undefined]
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 2,  // two repetitions
    });
    
    // Expect trialList to be a single undefined element
    expect(handler.trialList).toEqual([undefined]);
    // nStim = number of unique stimuli = 1
    expect(handler.nStim).toBe(1);
    // nTotal = nStim * nReps = 2
    expect(handler.nTotal).toBe(2);
    // nRemaining starts equal to nTotal
    expect(handler.nRemaining).toBe(2);
    // thisN and thisTrialN start at -1 (before any trials)
    expect(handler.thisN).toBe(-1);
    expect(handler.thisTrialN).toBe(-1);
  });

  test("constructor should handle trialList as an array", () => {
    const myTrials = [{ condition: "A" }, { condition: "B" }];
    // Provide an explicit trialList array
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 2,
      trialList: myTrials,
      method: TrialHandler.Method.SEQUENTIAL,
    });
    // trialList reference should be the same array
    expect(handler.trialList).toBe(myTrials);
    // nStim = 2 unique trials
    expect(handler.nStim).toBe(2);
    // nTotal = 2 trials * 2 reps = 4
    expect(handler.nTotal).toBe(4);
  });

  test("constructor should handle empty trialList as [undefined]", () => {
    // Empty array should revert to [undefined]
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 1,
      trialList: [],
    });
    expect(handler.trialList).toEqual([undefined]);
  });

  test("should shuffle (RANDOM) vs no shuffle (SEQUENTIAL)", () => {
    const trials = ["A", "B", "C"];

    // SEQUENTIAL mode => no shuffling per repetition
    const handler1 = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.SEQUENTIAL,
    });
    // Each repetition row should equal [0,1,2]
    expect(handler1._trialSequence[0]).toEqual([0,1,2]);
    expect(handler1._trialSequence[1]).toEqual([0,1,2]);
  
    // RANDOM mode => shuffle within each repetition
    // Use a fixed seed for reproducibility
    const handler2 = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.RANDOM,
      seed: 99999,
    });
    const row0 = handler2._trialSequence[0];
    const row1 = handler2._trialSequence[1];
    
    // At least one repetition should differ from the original order
    expect(row0).not.toEqual([0,1,2]);
    expect(row1).not.toEqual([0,1,2]);
  });

  test("next() should increment counters and return correct trials", () => {
    const trials = [{ cond: "A" }, { cond: "B" }];
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.SEQUENTIAL,
    });
    // Initial state before any trials
    expect(handler.thisN).toBe(-1);
    expect(handler.nRemaining).toBe(4);

    // 1st call to next()
    const t1 = handler.next();
    expect(handler.thisN).toBe(0);
    expect(handler.thisTrialN).toBe(0);
    expect(handler.nRemaining).toBe(3);
    expect(handler.thisTrial).toEqual({ cond: "A" });
    expect(t1).toEqual({ cond: "A" });

    // 2nd call to next()
    const t2 = handler.next();
    expect(handler.thisN).toBe(1);
    expect(handler.thisTrialN).toBe(1);
    expect(handler.nRemaining).toBe(2);
    expect(t2).toEqual({ cond: "B" });

    // 3rd call => start of 2nd repetition
    const t3 = handler.next();
    expect(handler.thisN).toBe(2);
    expect(handler.thisTrialN).toBe(0);
    expect(handler.nRemaining).toBe(1);
    expect(t3).toEqual({ cond: "A" });

    // 4th call => last trial
    const t4 = handler.next();
    expect(handler.thisN).toBe(3);
    expect(handler.thisTrialN).toBe(1);
    expect(handler.nRemaining).toBe(0);
    expect(t4).toEqual({ cond: "B" });

    // 5th call => no trials left, should return undefined
    const t5 = handler.next();
    expect(t5).toBeUndefined();
    expect(handler.thisTrial).toBeNull();
  });

  test("iterator should produce all trials in order", () => {
    const trials = [{ cond: 1 }, { cond: 2 }];
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 1,
      method: TrialHandler.Method.SEQUENTIAL,
    });

    const results = [];
    // Use the iterable interface ([Symbol.iterator])
    for (const trial of handler) {
      results.push(trial);
    }
    expect(results).toEqual([{ cond: 1 }, { cond: 2 }]);
    // After exhausting, thisTrial should be null
    expect(handler.thisTrial).toBe(null);
  });

  test("getSnapshot() should capture current state", () => {
    const trials = [{ cond: "X" }, { cond: "Y" }];
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 1,
      method: TrialHandler.Method.SEQUENTIAL,
      name: "myLoop",
    });
    // Before any trial, snapshot should reflect initial counters
    const snap0 = handler.getSnapshot();
    expect(snap0.thisTrialN).toBe(-1);
    expect(snap0.finished).toBe(false);
    expect(handler._snapshots).toHaveLength(1);

    // After first next(), snapshot should update
    handler.next();
    const snap1 = handler.getSnapshot();
    expect(snap1.thisTrialN).toBe(0);
    expect(snap1.getCurrentTrial()).toEqual({ cond: "X" });
    expect(handler._snapshots).toHaveLength(2);
  });

  test("addData() calls experimentHandler.addData if experimentHandler assigned", () => {
    const mockExpHandler = { addData: jest.fn() };
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: [{ cond: "A" }],
      nReps: 1,
    });
    // Attach a fake ExperimentHandler
    handler.experimentHandler = mockExpHandler;

    handler.addData("accuracy", 0.9);
    // Should forward to experimentHandler.addData
    expect(mockExpHandler.addData).toHaveBeenCalledWith("accuracy", 0.9);
  });

  test("finished setter updates all snapshots finished property", () => {
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: [{ cond: 1 }, { cond: 2 }],
      nReps: 1,
    });
    // Generate a few snapshots
    handler.getSnapshot();
    handler.next();
    handler.getSnapshot();
    handler.next();
    handler.getSnapshot();
    expect(handler._snapshots).toHaveLength(3);

    // Mark finished => every snapshot.finished should become true
    handler.finished = true;
    for (const s of handler._snapshots) {
      expect(s.finished).toBe(true);
    }
  });

  test("METHOD.FULL_RANDOM flattens then shuffles the entire set", () => {
    const trials = ["A", "B", "C"];
    // FULL_RANDOM: flatten all reps, then shuffle indices
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.FULL_RANDOM,
      seed: 99999,
    });
    // Combine the two repetition rows into one array of indices
    const merged = [...handler._trialSequence[0], ...handler._trialSequence[1]];
    // When sorted, should contain each index twice
    expect(merged.sort()).toEqual([0,0,1,1,2,2]);
    // But neither repetition should remain in original order
    expect(handler._trialSequence[0]).not.toEqual([0,1,2]);
    expect(handler._trialSequence[1]).not.toEqual([0,1,2]);
  });
});
