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
jest.unstable_mockModule("docker-compose", () => ({
  upAll: jest.fn(),
  upMany: jest.fn(),
  down: jest.fn(),
  logs: jest.fn(),
  version: jest
    .fn<() => Promise<{ data: { version: string } }>>()
    .mockResolvedValue({ data: { version: "1.2.3" } }),
}));

// Mock node:fs
jest.unstable_mockModule("node:fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  default: { existsSync: jest.fn().mockReturnValue(true) },
}));

// Dynamic imports after mock setup
const { run } = await import("./index-runner.js");
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import("./services/logger.service.js");
const { DockerComposeInstallerService } = await import(
  "./services/docker-compose-installer.service.js"
);
const { DockerComposeService } = await import("./services/docker-compose.service.js");

describe("run", () => {
  let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
  let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
  let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
  let installMock: jest.SpiedFunction<typeof DockerComposeInstallerService.prototype.install>;
  let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;

  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation(() => {});
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation(() => {});
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    installMock = jest.spyOn(DockerComposeInstallerService.prototype, "install");
    upMock = jest.spyOn(DockerComposeService.prototype, "up");
  });

  it("should install docker compose with specified version", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => ({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: "1.29.2",
      githubToken: null,
      serviceLogLevel: LogLevel.Debug,
    }));

    installMock.mockResolvedValue("1.29.2");

    upMock.mockResolvedValue();

    // Act
    await run();

    // Assert
    expect(infoMock).toHaveBeenCalledWith("Setting up docker compose version 1.29.2");

    expect(debugMock).toHaveBeenCalledWith(
      'inputs: {"dockerFlags":[],"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":"1.29.2","githubToken":null,"serviceLogLevel":"debug"}'
    );

    expect(installMock).toHaveBeenCalledWith({
      composeVersion: "1.29.2",
      cwd: "/current/working/dir",
      githubToken: null,
    });

    expect(upMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      upFlags: [],
      services: [],
      serviceLogger: debugMock,
    });

    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should bring up docker compose services", async () => {
    // Arrange
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
    expect(upMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      upFlags: [],
      services: ["web"],
      serviceLogger: debugMock,
    });
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should handle errors and call setFailed", async () => {
    // Arrange
    const error = new Error("Test error");
    upMock.mockRejectedValue(error);

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
    upMock.mockRejectedValue(error);

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
