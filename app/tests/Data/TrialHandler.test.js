// Mock environment and dependencies as before
import { TrialHandler } from "../../../src/data/TrialHandler.js";
import "../setup.js";

/**
 * Mock for serverManager to test importConditions.
 */
const mockServerManager = {
  getResource: jest.fn(),
};

/**
 * Minimal PsychoJS mock.
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
    jest.clearAllMocks();
  });

  test("constructor should handle default trialList=[undefined]", () => {
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 2,
    });
    
    // By default, trialList=[undefined]
    expect(handler.trialList).toEqual([undefined]);
    // nStim=1 * nReps=2 => nTotal=2
    expect(handler.nStim).toBe(1);
    expect(handler.nTotal).toBe(2);
    expect(handler.nRemaining).toBe(2);
    expect(handler.thisN).toBe(-1);
    expect(handler.thisTrialN).toBe(-1);
  });

  test("constructor should handle trialList as an array", () => {
    const myTrials = [{ condition: "A" }, { condition: "B" }];
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 2,
      trialList: myTrials,
      method: TrialHandler.Method.SEQUENTIAL,
    });
    expect(handler.trialList).toBe(myTrials);
    expect(handler.nStim).toBe(2);
    expect(handler.nTotal).toBe(4); // 2 trials * 2 reps
  });

  test("constructor should handle empty trialList as [undefined]", () => {
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      nReps: 1,
      trialList: [],
    });
    expect(handler.trialList).toEqual([undefined]);
  });

  test("should shuffle (RANDOM) vs no shuffle (SEQUENTIAL)", () => {
    const trials = ["A", "B", "C"];

    // SEQUENTIAL
    const handler1 = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.SEQUENTIAL,
    });
    // For SEQUENTIAL, each row in _trialSequence is simply [0,1,2]
    expect(handler1._trialSequence[0]).toEqual([0,1,2]);
    expect(handler1._trialSequence[1]).toEqual([0,1,2]);
  
    // RANDOM
    // Use a bigger seed to reduce accidental collisions
    const seed = 99999;
    const handler2 = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.RANDOM,
      seed: seed,
    });
    const row0 = handler2._trialSequence[0];
    const row1 = handler2._trialSequence[1];
    
    // Check that at least one row differs from [0,1,2]
    // The chance to get [0,1,2] exactly is small, but still possible.
    // We'll do a simpler check:
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
    // Initially:
    expect(handler.thisN).toBe(-1);
    expect(handler.nRemaining).toBe(4);

    // 1st next()
    const t1 = handler.next();
    expect(handler.thisN).toBe(0);
    expect(handler.thisTrialN).toBe(0);
    expect(handler.nRemaining).toBe(3);
    expect(handler.thisTrial).toEqual({ cond: "A" });
    expect(t1).toEqual({ cond: "A" });

    // 2nd next()
    const t2 = handler.next();
    expect(handler.thisN).toBe(1);
    expect(handler.thisTrialN).toBe(1);
    expect(handler.nRemaining).toBe(2);
    expect(t2).toEqual({ cond: "B" });

    // 3rd next() => new repetition
    const t3 = handler.next();
    expect(handler.thisN).toBe(2);
    expect(handler.thisTrialN).toBe(0);
    expect(handler.nRemaining).toBe(1);
    expect(t3).toEqual({ cond: "A" });

    // 4th next()
    const t4 = handler.next();
    expect(handler.thisN).toBe(3);
    expect(handler.thisTrialN).toBe(1);
    expect(handler.nRemaining).toBe(0);
    expect(t4).toEqual({ cond: "B" });

    // 5th next() => done
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
    for (const trial of handler) {
      results.push(trial);
    }
    expect(results).toEqual([{ cond: 1 }, { cond: 2 }]);
    // Once finished, thisTrial becomes null
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
    // Before first next():
    const snap0 = handler.getSnapshot();
    expect(snap0.thisTrialN).toBe(-1);
    expect(snap0.finished).toBe(false);
    expect(handler._snapshots).toHaveLength(1);

    // After next():
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
    handler.experimentHandler = mockExpHandler;

    handler.addData("accuracy", 0.9);
    expect(mockExpHandler.addData).toHaveBeenCalledWith("accuracy", 0.9);
  });

  test("finished setter updates all snapshots finished property", () => {
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: [{ cond: 1 }, { cond: 2 }],
      nReps: 1,
    });
    // Create a few snapshots
    handler.getSnapshot();
    handler.next();
    handler.getSnapshot();
    handler.next();
    handler.getSnapshot();
    expect(handler._snapshots).toHaveLength(3);

    handler.finished = true;
    for (const s of handler._snapshots) {
      expect(s.finished).toBe(true);
    }
  });

  test("METHOD.FULL_RANDOM flattens then shuffles the entire set", () => {
    const trials = ["A", "B", "C"];
    // nReps=2 => initially [A,B,C,A,B,C], then shuffle
    const handler = new TrialHandler({
      psychoJS: mockPsychoJS,
      trialList: trials,
      nReps: 2,
      method: TrialHandler.Method.FULL_RANDOM,
      seed: 99999,
    });
    // The sequence is stored in _trialSequence as 2 rows, each with length=3
    const merged = [...handler._trialSequence[0], ...handler._trialSequence[1]];
    expect(merged.sort()).toEqual([0,0,1,1,2,2]); // index 0,1,2 repeated twice
    // But we don't want them in original order: [0,1,2,0,1,2]
    expect(handler._trialSequence[0]).not.toEqual([0,1,2]);
    expect(handler._trialSequence[1]).not.toEqual([0,1,2]);
  });
});
