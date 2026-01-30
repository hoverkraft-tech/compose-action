import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock @actions/core
const setFailedMock = jest.fn();

jest.unstable_mockModule("@actions/core", () => ({
  setFailed: setFailedMock,
  getInput: jest.fn().mockReturnValue(""),
  getMultilineInput: jest.fn().mockReturnValue([]),
  debug: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}));

// Mock docker-compose
const logsMock = jest.fn();
const downMock = jest.fn();

jest.unstable_mockModule("docker-compose", () => ({
  logs: logsMock,
  down: downMock,
  upAll: jest.fn(),
  upMany: jest.fn(),
}));

// Mock node:fs
jest.unstable_mockModule("node:fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  default: { existsSync: jest.fn().mockReturnValue(true) },
}));

// Dynamic imports after mock setup
const { run } = await import("./post-runner.js");
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import("./services/logger.service.js");
const { DockerComposeService } = await import("./services/docker-compose.service.js");

describe("run", () => {
  let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
  let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
  let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
  let serviceDownMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;
  let serviceLogsMock: jest.SpiedFunction<typeof DockerComposeService.prototype.logs>;

  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation(() => {});
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation(() => {});
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    serviceDownMock = jest.spyOn(DockerComposeService.prototype, "down");
    serviceLogsMock = jest.spyOn(DockerComposeService.prototype, "logs");
  });

  it("should bring down docker compose service(s) and log output", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => ({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
      serviceLogLevel: LogLevel.Debug,
    }));

    serviceLogsMock.mockResolvedValue({ error: "", output: "test logs" });
    serviceDownMock.mockResolvedValue();

    // Act
    await run();

    // Assert
    expect(serviceLogsMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      services: [],
      serviceLogger: debugMock,
    });

    expect(serviceDownMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      downFlags: [],
      serviceLogger: debugMock,
    });

    expect(debugMock).toHaveBeenCalledWith("docker compose logs:\ntest logs");
    expect(infoMock).toHaveBeenCalledWith("docker compose is down");
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should log docker composer errors if any", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => ({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
      serviceLogLevel: LogLevel.Debug,
    }));

    serviceLogsMock.mockResolvedValue({
      error: "test logs error",
      output: "test logs output",
    });

    serviceDownMock.mockResolvedValue();

    // Act
    await run();

    // Assert
    expect(debugMock).toHaveBeenCalledWith("docker compose error:\ntest logs error");
    expect(debugMock).toHaveBeenCalledWith("docker compose logs:\ntest logs output");
    expect(infoMock).toHaveBeenCalledWith("docker compose is down");
  });

  it("should set failed when an error occurs", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => {
      throw new Error("An error occurred");
    });

    // Act
    await run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith("Error: An error occurred");
  });

  it("should handle errors and call setFailed", async () => {
    // Arrange
    const error = new Error("Test error");
    serviceDownMock.mockRejectedValue(error);

    getInputsMock.mockImplementation(() => ({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: ["web"],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
      serviceLogLevel: LogLevel.Debug,
    }));

    // Act
    await run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith("Error: Test error");
  });

  it("should handle unknown errors and call setFailed", async () => {
    // Arrange
    const error = "Test error";
    serviceDownMock.mockRejectedValue(error);

    getInputsMock.mockImplementation(() => ({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: ["web"],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
      serviceLogLevel: LogLevel.Debug,
    }));

    // Act
    await run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith('"Test error"');
  });
});
