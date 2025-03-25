import { Logger } from '../../src/core/Logger.js';
import { MonotonicClock } from '../../src/util/Clock.js';
import log4javascript from 'log4javascript';

// Mock ServerManager before other imports
jest.mock('../../src/core/ServerManager.js', () => {
    return {
        ServerManager: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            _setupPreloadQueue: jest.fn(),
            _psychoJS: {},
            _preloadQueue: {
                addEventListener: jest.fn(),
                loadFile: jest.fn(),
                load: jest.fn()
            }
        })),
        Event: {
            RESOURCE: 'RESOURCE',
            LOG: 'LOG',
            ERROR: 'ERROR'
        }
    };
});

// Mock GUI
jest.mock('../../src/core/GUI.js', () => {
    return {
        GUI: jest.fn().mockImplementation(() => ({
            _onResourceEvents: jest.fn()
        }))
    };
});

describe('Logger', () => {
    let logger;
    const threshold = log4javascript.Level.ERROR;

    beforeEach(() => {
        // Create a Logger instance for testing
        logger = new Logger({ debug: true }, threshold);
    });

    afterEach(() => {
        logger = null;
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('should initialize throttling settings', () => {
            expect(logger._throttling).toEqual(expect.objectContaining({
                window: 1,
                threshold: 20,
                factor: 10,
                minimumDuration: 2,
                startOfThrottling: 0,
                isThrottling: false,
                index: 0,
                designerWasWarned: false
            }));
        });
    });

    describe('logging methods', () => {
        test('exp should log at EXP level', () => {
            const msg = 'exp test';
            logger.exp(msg);
            expect(logger._serverLogs[0]).toEqual(expect.objectContaining({
                msg,
                level: Logger.ServerLevel.EXP
            }));
        });

        test('data should log at DATA level', () => {
            const msg = 'data test';
            logger.data(msg);
            expect(logger._serverLogs[0]).toEqual(expect.objectContaining({
                msg,
                level: Logger.ServerLevel.DATA
            }));
        });

        test('should handle custom time parameter', () => {
            const customTime = 12345;
            logger.log('test', Logger.ServerLevel.ERROR, customTime);
            expect(logger._serverLogs[0].time).toBe(customTime);
        });

        test('should use MonotonicClock time if no time provided', () => {
            const now = MonotonicClock.getReferenceTime();
            logger.log('test', Logger.ServerLevel.ERROR);
            expect(logger._serverLogs[0].time).toBeGreaterThanOrEqual(now);
        });

        test('should handle associated objects', () => {
            const testObj = { id: 1, name: 'test' };
            logger.log('test', Logger.ServerLevel.ERROR, undefined, testObj);
            expect(logger._serverLogs[0].obj).toContain('test');
        });
    });

    describe('throttling', () => {
        test('should start throttling when threshold is exceeded', () => {
            const time = MonotonicClock.getReferenceTime();
            
            // Generate more messages than threshold
            for (let i = 0; i < logger._throttling.threshold + 5; i++) {
                logger._serverLogs.push({
                    msg: `test ${i}`,
                    level: Logger.ServerLevel.WARNING,
                    time: time - 0.1
                });
            }

            expect(logger._throttle(time)).toBe(true);
            expect(logger._throttling.isThrottling).toBe(true);
        });

        test('should stop throttling after minimum duration', () => {
            const startTime = MonotonicClock.getReferenceTime();
            
            // Trigger throttling
            for (let i = 0; i < logger._throttling.threshold + 5; i++) {
                logger._serverLogs.push({
                    msg: `test ${i}`,
                    level: Logger.ServerLevel.WARNING,
                    time: startTime
                });
            }
            
            logger._throttle(startTime);
            expect(logger._throttling.isThrottling).toBe(true);

            // Check after minimum duration
            const afterMinDuration = startTime + logger._throttling.minimumDuration + 1;
            logger._throttle(afterMinDuration);
            expect(logger._throttling.isThrottling).toBe(false);
        });
    });
}); 