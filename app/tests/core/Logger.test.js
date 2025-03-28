/**
 * Sample Jest tests for the Logger class
 */

import { Logger } from "../../../src/core/Logger.js";

jest.mock("log4javascript", () => {
  return {
    getLogger: jest.fn().mockReturnValue({
      addAppender: jest.fn(),
      setLevel: jest.fn(),
    }),
    BrowserConsoleAppender: jest.fn().mockImplementation(() => ({
      setLayout: jest.fn(),
      setThreshold: jest.fn(),
    })),
    PatternLayout: jest.fn().mockImplementation(() => ({
      setCustomField: jest.fn(),
    })),
  };
});

describe("Logger class", () => {
  let mockPsychoJS;
  let logger;

  beforeEach(() => {
    mockPsychoJS = {
      logger: {
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
      },
      gui: {
        dialog: jest.fn(),
      },
      serverManager: {
        uploadLog: jest.fn().mockResolvedValue("OK"),
      },
      config: {
        experiment: {
          fullpath: "some/experiment/path",
          status: "RUNNING"
        }
      },
      getEnvironment: jest.fn(() => "SERVER"),
      _serverMsg: new Map()
    };
    logger = new Logger(mockPsychoJS, "DEBUG");
  });

  test("should instantiate consoleLogger and set threshold in constructor", () => {
    // Перевіряємо, що log4javascript викликалося
    const log4js = require("log4javascript");
    expect(log4js.getLogger).toHaveBeenCalledWith("psychojs");
    expect(log4js.BrowserConsoleAppender).toHaveBeenCalledTimes(1);

    const mockAppender = log4js.BrowserConsoleAppender.mock.results[0].value;
    expect(mockAppender.setThreshold).toHaveBeenCalledWith("DEBUG");
  });

  test("setLevel should update serverLevelValue", () => {
    logger.setLevel(Logger.ServerLevel.INFO);
    expect(logger._serverLevel).toBe(Logger.ServerLevel.INFO);
    expect(logger._serverLevelValue).toBe(20);
  });

  test("should log messages to _serverLogs if level >= current serverLevel", () => {
    logger.log("MsgBelowThreshold", Logger.ServerLevel.DATA);
    expect(logger._serverLogs).toHaveLength(0);

    logger.log("WarningMsg", Logger.ServerLevel.WARNING);
    expect(logger._serverLogs).toHaveLength(1);
    expect(logger._serverLogs[0]).toMatchObject({
      msg: "WarningMsg",
      level: Logger.ServerLevel.WARNING,
    });
  });

  test("exp() and data() call log(...) with correct levels", () => {
    logger.setLevel(Logger.ServerLevel.DATA);
    // => DATA=25, EXP=22, threshold=25 => DATA=25 >=25 => logs, EXP=22 <25 => skip ?

    // exp => level=EXP(22) => <25 => не логуватиметься
    logger.exp("Experiment msg");
    expect(logger._serverLogs).toHaveLength(0);

    // data => level=DATA(25) => 25>=25 => log
    logger.data("Data msg");
    expect(logger._serverLogs).toHaveLength(1);
    expect(logger._serverLogs[0].msg).toBe("Data msg");
    expect(logger._serverLogs[0].level).toBe(Logger.ServerLevel.DATA);
  });


  test('should format logs correctly', async () => {
    const testMessage = 'test message';
    logger.log(testMessage, Logger.ServerLevel.ERROR);
    
    // Mock the necessary environment for flush
    mockPsychoJS.getEnvironment = jest.fn().mockReturnValue('SERVER');
    mockPsychoJS.config.experiment = {
        status: 'RUNNING',
        fullpath: 'test/path'
    };

    await logger.flush();
    
    // Verify the logs were processed
    expect(logger._serverLogs).toHaveLength(1);
    expect(logger._serverLogs[0].msg).toBe(testMessage);
});

  test("flush() does nothing but print to debug if environment != SERVER or experiment.status != 'RUNNING'", async () => {
    mockPsychoJS.getEnvironment.mockReturnValueOnce("LOCAL");
    logger.log("LocalMsg", Logger.ServerLevel.CRITICAL);
    await logger.flush();

    expect(mockPsychoJS.serverManager.uploadLog).not.toHaveBeenCalled();
    expect(mockPsychoJS.logger.debug).toHaveBeenCalledWith(expect.stringContaining("LocalMsg"));
  });
});
