import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Import types directly from the module
import type { LogLevel as LogLevelType } from "./logger.service.js";

// Mock @actions/core before importing the module under test
const warningMock = jest.fn();
const infoMock = jest.fn();
const debugMock = jest.fn();

jest.unstable_mockModule("@actions/core", () => ({
  warning: warningMock,
  info: infoMock,
  debug: debugMock,
}));

// Dynamic import after mock setup
const { LoggerService, LogLevel } = await import("./logger.service.js");

describe("LoggerService", () => {
  let loggerService: InstanceType<typeof LoggerService>;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerService = new LoggerService();
  });

  describe("warn", () => {
    it("should call warning with the correct message", () => {
      const message = "This is a warning message";
      loggerService.warn(message);
      expect(warningMock).toHaveBeenCalledWith(message);
    });
  });

  describe("info", () => {
    it("should call info with the correct message", () => {
      const message = "This is an info message";
      loggerService.info(message);
      expect(infoMock).toHaveBeenCalledWith(message);
    });
  });

  describe("debug", () => {
    it("should call debug with the correct message", () => {
      const message = "This is a debug message";
      loggerService.debug(message);
      expect(debugMock).toHaveBeenCalledWith(message);
    });
  });

  describe("getServiceLogger", () => {
    it("should return the correct logger function for debug level", () => {
      const logger = loggerService.getServiceLogger(LogLevel.Debug);
      expect(logger).toBe(loggerService.debug);
    });

    it("should return the correct logger function for info level", () => {
      const logger = loggerService.getServiceLogger(LogLevel.Info);
      expect(logger).toBe(loggerService.info);
    });

    it("should default to info level if an unknown level is provided", () => {
      const logger = loggerService.getServiceLogger("unknown" as LogLevelType);
      expect(logger).toBe(loggerService.info);
    });
  });
});
