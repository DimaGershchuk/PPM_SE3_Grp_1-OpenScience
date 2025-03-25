import { Logger } from '../../src/core/Logger.js';
import { PsychoJS } from '../../src/core/PsychoJS.js';
import { MonotonicClock } from '../../src/util/Clock.js';
import log4javascript from 'log4javascript';

// Mock ServerManager module
jest.mock('../../src/core/ServerManager.js', () => {
    return {
        ServerManager: jest.fn().mockImplementation(() => ({
            _setupPreloadQueue: jest.fn(),
            _psychoJS: {},
            _preloadQueue: {
                addEventListener: jest.fn(),
                loadFile: jest.fn(),
                load: jest.fn()
            }
        }))
    };
});

describe('Logger', () => {
    let psychoJS;
    let logger;
    const threshold = log4javascript.Level.ERROR;

    beforeAll(() => {
        // Set up DOM mocking
        const rootElement = {
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            }
        };

        // Mock document methods
        document.getElementById = jest.fn((id) => {
            if (id === 'root') return rootElement;
            return null;
        });

        // Mock createjs globally
        global.createjs = {
            LoadQueue: jest.fn().mockImplementation(() => ({
                addEventListener: jest.fn(),
                loadFile: jest.fn(),
                load: jest.fn()
            }))
        };
    });

    beforeEach(() => {
        // Create a mock PsychoJS instance
        psychoJS = new PsychoJS({
            debug: true
        });
        
        // Create a Logger instance for testing
        logger = new Logger(psychoJS, threshold);
    });

    afterEach(() => {
        // Clean up
        logger = null;
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('should create a Logger instance with correct initialization', () => {
            expect(logger._psychoJS).toBe(psychoJS);
            expect(logger.consoleLogger).toBeDefined();
            expect(logger._serverLogs).toEqual([]);
            expect(logger._serverLevel).toBe(Logger.ServerLevel.WARNING);
        });

        test('should set up console logger with correct threshold', () => {
            expect(logger.consoleLogger.getEffectiveLevel()).toBe(threshold);
        });

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

    describe('setLevel', () => {
        test('should change server logging level', () => {
            logger.setLevel(Logger.ServerLevel.ERROR);
            expect(logger._serverLevel).toBe(Logger.ServerLevel.ERROR);
            expect(logger._serverLevelValue).toBe(logger._getValue(Logger.ServerLevel.ERROR));
        });

        test('should affect subsequent logging calls', () => {
            logger.setLevel(Logger.ServerLevel.ERROR);
            logger.log('test message', Logger.ServerLevel.WARNING);
            expect(logger._serverLogs).toHaveLength(0);
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

        test('log should respect level threshold', () => {
            logger.setLevel(Logger.ServerLevel.ERROR);
            logger.log('test', Logger.ServerLevel.WARNING);
            expect(logger._serverLogs).toHaveLength(0);

            logger.log('test', Logger.ServerLevel.ERROR);
            expect(logger._serverLogs).toHaveLength(1);
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

        test('should allow messages through based on throttling factor', () => {
            const time = MonotonicClock.getReferenceTime();
            
            // Fill logs to trigger throttling
            for (let i = 0; i < logger._throttling.threshold + 5; i++) {
                logger._serverLogs.push({
                    msg: `test ${i}`,
                    level: Logger.ServerLevel.WARNING,
                    time: time - 0.1
                });
            }

            // Test throttling pattern
            const results = [];
            for (let i = 0; i < logger._throttling.factor * 2; i++) {
                results.push(!logger._throttle(time));
            }

            // Should see a pattern of one true followed by (factor-1) false values
            expect(results.filter(r => r).length).toBe(2);
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

    describe('flush', () => {
        test('should format logs correctly', async () => {
            const testMessage = 'test message';
            logger.log(testMessage, Logger.ServerLevel.ERROR);
            
            // Mock the necessary environment for flush
            psychoJS.getEnvironment = jest.fn().mockReturnValue('SERVER');
            psychoJS.config.experiment = {
                status: 'RUNNING',
                fullpath: 'test/path'
            };

            await logger.flush();
            
            // Verify the logs were processed
            expect(logger._serverLogs).toHaveLength(1);
            expect(logger._serverLogs[0].msg).toBe(testMessage);
        });

        test('should handle empty logs', async () => {
            await expect(logger.flush()).resolves.not.toThrow();
        });
    });
}); 