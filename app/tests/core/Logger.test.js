import { Logger } from '../../src/core/Logger.js';
import { PsychoJS } from '../__mocks__/PsychoJS.js';
import log4javascript from 'log4javascript';

// Mock log4javascript methods we use
const mockConsoleLogger = {
    addAppender: jest.fn(),
    setLevel: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn()
};

jest.spyOn(log4javascript, 'getLogger').mockReturnValue(mockConsoleLogger);

// Add ServerLevel to Logger
Logger.ServerLevel = {
    EXP: Symbol.for('EXP'),
    DATA: Symbol.for('DATA'),
    DEBUG: Symbol.for('DEBUG'),
    INFO: Symbol.for('INFO'),
    WARNING: Symbol.for('WARNING'),
    ERROR: Symbol.for('ERROR'),
    CRITICAL: Symbol.for('CRITICAL')
};

describe('Logger', () => {
    let psychoJS;
    let logger;

    beforeEach(() => {
        // Create a new PsychoJS instance for each test
        psychoJS = new PsychoJS();
        // Create a new Logger instance for each test
        logger = new Logger(psychoJS, log4javascript.Level.INFO);
        // Initialize logs array
        logger._serverLogs = [];
        // Mock _getValue to return actual level values
        logger._getValue.mockImplementation((level) => {
            const levelMap = {
                [Logger.ServerLevel.DEBUG]: 10,
                [Logger.ServerLevel.INFO]: 20,
                [Logger.ServerLevel.EXP]: 22,
                [Logger.ServerLevel.DATA]: 25,
                [Logger.ServerLevel.WARNING]: 30,
                [Logger.ServerLevel.ERROR]: 40,
                [Logger.ServerLevel.CRITICAL]: 50
            };
            return levelMap[level] || 30;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a Logger instance', () => {
        expect(logger).toBeDefined();
        expect(logger._psychoJS).toBe(psychoJS);
    });

    it('should log messages to server logs', () => {
        logger.exp('test message');
        expect(logger._serverLogs.length).toBe(1);
        expect(logger._serverLogs[0].msg).toBe('test message');
        expect(logger._serverLogs[0].level).toBe(Logger.ServerLevel.EXP);
    });

    it('should set log level', () => {
        logger.setLevel(Symbol.for('DEBUG'));
        expect(logger._serverLevel).toBe(Symbol.for('DEBUG'));
    });

    it('should respect log level when logging', () => {
        // Set level to INFO (20)
        logger.setLevel(Logger.ServerLevel.INFO);
        // EXP (22) is higher than INFO (20), so this should be logged
        logger.exp('test message');
        expect(logger._serverLogs.length).toBe(1);

        // Set level to CRITICAL (50)
        logger.setLevel(Logger.ServerLevel.CRITICAL);
        // EXP (22) is lower than CRITICAL (50), so this should not be logged
        logger.exp('another message');
        expect(logger._serverLogs.length).toBe(1); // Still 1, not 2
    });

    it('exp() and data() should respect log levels correctly', () => {
        logger.setLevel(Logger.ServerLevel.DATA); // DATA = 25

        // exp => level=EXP(22) < DATA(25) => should not be logged
        logger.exp('Experiment msg');
        expect(logger._serverLogs).toHaveLength(0);

        // data => level=DATA(25) >= DATA(25) => should be logged
        logger.data('Data msg');
        expect(logger._serverLogs).toHaveLength(1);
        expect(logger._serverLogs[0].msg).toBe('Data msg');
        expect(logger._serverLogs[0].level).toBe(Logger.ServerLevel.DATA);
    });
});
