import { Scheduler } from "../../src/util/Scheduler.js";

class MockWindow {
  render = jest.fn();
}

class MockExperiment {
  experimentEnded = false;
}

class MockPsychoJS {
  constructor() {
    this.experiment = new MockExperiment();
    this.window = new MockWindow();
  }
}

describe("Scheduler", () => {
  let mockPsychoJS;
  let scheduler;

  beforeEach(() => {
    mockPsychoJS = new MockPsychoJS();
    scheduler = new Scheduler(mockPsychoJS);
  });

  test("should instantiate properly", () => {
    expect(scheduler).toBeInstanceOf(Scheduler);
    expect(scheduler.status).toBe(Scheduler.Status.STOPPED);
  });

  test("should add tasks and run them with _runNextTasks()", async () => {
    // Create some simple tasks:
    const task1 = jest.fn(() => Scheduler.Event.NEXT);
    const task2 = jest.fn(() => Scheduler.Event.QUIT);

    // Add them to the scheduler
    scheduler.add(task1);
    scheduler.add(task2);

    // Manually call the internal cycle once:
    const state = await scheduler._runNextTasks();

    // Tests:
    // 1) The first task is called and returns NEXT => move to the second
    // 2) The second returns QUIT => everything stops
    expect(task1).toHaveBeenCalledTimes(1);
    expect(task2).toHaveBeenCalledTimes(1);
    expect(state).toBe(Scheduler.Event.QUIT);

    // The scheduler switched status to RUNNING, then ended after QUIT
    expect(scheduler.status).toBe(Scheduler.Status.STOPPED);
  });

  test("should handle FLIP_REPEAT and FLIP_NEXT correctly", async () => {
    // Make a task that returns FLIP_REPEAT twice, then FLIP_NEXT
    let callCount = 0;
    const repeatingTask = jest.fn(() => {
      callCount++;
      if (callCount < 3) {
        return Scheduler.Event.FLIP_REPEAT;
      } else {
        return Scheduler.Event.FLIP_NEXT;
      }
    });

    // Second task simply QUIT
    const finalTask = jest.fn(() => Scheduler.Event.QUIT);

    scheduler.add(repeatingTask);
    scheduler.add(finalTask);

    // Single call of _runNextTasks:
    const state = await scheduler._runNextTasks();

    // FLIP_REPEAT twice -> the same task called 3 times in total
    expect(repeatingTask).toHaveBeenCalledTimes(3);
    // After FLIP_NEXT, we move to finalTask
    expect(finalTask).toHaveBeenCalledTimes(1);

    // finalTask returns QUIT => the result state is QUIT
    expect(state).toBe(Scheduler.Event.QUIT);
  });

  test("should run a sub-scheduler task", async () => {
    // Sub-scheduler with one task that returns NEXT
    const subScheduler = new Scheduler(mockPsychoJS);
    const subTask = jest.fn(() => Scheduler.Event.NEXT);
    subScheduler.add(subTask);

    // After finishing its tasks, subScheduler returns QUIT
    // but if experiment isn't ended, we set state = NEXT in the parent.
    // => see code in _runNextTasks

    // Add sub-scheduler to the main scheduler
    scheduler.add(subScheduler);

    // Launch
    const state = await scheduler._runNextTasks();

    // Verify subTask was called
    expect(subTask).toHaveBeenCalledTimes(1);

    // After finishing, subScheduler returned QUIT, but experimentEnded = false,
    // so the Scheduler sets state = NEXT
    // Because parent has no other tasks, _runNextTasks ends with QUIT
    expect(state).toBe(Scheduler.Event.QUIT);
  });

  test("should conditionally branch using addConditional()", async () => {
    // Two schedulers
    const thenSched = new Scheduler(mockPsychoJS);
    const elseSched = new Scheduler(mockPsychoJS);

    const thenTask = jest.fn(() => Scheduler.Event.NEXT);
    const elseTask = jest.fn(() => Scheduler.Event.NEXT);

    thenSched.add(thenTask);
    elseSched.add(elseTask);

    // Condition
    const condition = jest.fn(() => true);

    // addConditional => if condition=true, thenSched; else elseSched
    scheduler.addConditional(condition, thenSched, elseSched);

    // Launch
    const finalState = await scheduler._runNextTasks();

    // condition called once
    expect(condition).toHaveBeenCalledTimes(1);
    // thenTask triggered, elseTask did not
    expect(thenTask).toHaveBeenCalledTimes(1);
    expect(elseTask).toHaveBeenCalledTimes(0);

    expect(finalState).toBe(Scheduler.Event.QUIT);
  });

  test("stop() should stop scheduler at the next update", async () => {
    // Create a task that returns Scheduler.Event.NEXT
    const task = jest.fn(() => Scheduler.Event.NEXT);
    scheduler.add(task);

    // Call stop()
    scheduler.stop();
    // _runNextTasks sees _stopAtNextTask=true and returns QUIT
    const st = await scheduler._runNextTasks();
    expect(st).toBe(Scheduler.Event.QUIT);

    // Because we stopped before the first task, it never executes
    expect(task).toHaveBeenCalledTimes(0);
    expect(scheduler.status).toBe(Scheduler.Status.STOPPED);
  });

  test("start() should call requestAnimationFrame and eventually resolve its promise", async () => {
    // Mock requestAnimationFrame
    let rAFCallback;
    global.requestAnimationFrame = jest.fn((cb) => {
      rAFCallback = cb;
      return 123; // an arbitrary “animation ID”
    });

    // Add a single task that returns QUIT
    const singleTask = jest.fn(() => Scheduler.Event.QUIT);
    scheduler.add(singleTask);

    const startPromise = scheduler.start();
    // start() calls requestAnimationFrame with 'update' callback
    // we haven't called rAFCallback() yet

    // Emulate animation frame invocation
    await rAFCallback(performance.now());

    // Verify the task was called
    expect(singleTask).toHaveBeenCalledTimes(1);

    // Task returns QUIT => scheduler stops
    await startPromise;
    expect(scheduler.status).toBe(Scheduler.Status.STOPPED);

    // Restore requestAnimationFrame
    global.requestAnimationFrame = undefined;
  });
});
