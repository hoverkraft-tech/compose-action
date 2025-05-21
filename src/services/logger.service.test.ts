import { LoggerService, LogLevel } from "./logger.service";
import { debug, info, warning } from "@actions/core";

jest.mock("@actions/core", () => ({
  warning: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe("LoggerService", () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("warn", () => {
    it("should call warning with the correct message", () => {
      const message = "This is a warning message";
      loggerService.warn(message);
      expect(warning).toHaveBeenCalledWith(message);
    });
  });

  describe("info", () => {
    it("should call info with the correct message", () => {
      const message = "This is an info message";

      loggerService.info(message);
      expect(info).toHaveBeenCalledWith(message);
    });
  });

  describe("debug", () => {
    it("should call debug with the correct message", () => {
      const message = "This is a debug message";

      loggerService.debug(message);
      expect(debug).toHaveBeenCalledWith(message);
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
      const logger = loggerService.getServiceLogger("unknown" as LogLevel);
      expect(logger).toBe(loggerService.info);
    });
  });
});
