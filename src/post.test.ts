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
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import("./services/logger.service.js");
const { DockerComposeService } = await import("./services/docker-compose.service.js");

let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let serviceLogsMock: jest.SpiedFunction<typeof DockerComposeService.prototype.logs>;
let serviceDownMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;

describe("post", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation(() => {});
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation(() => {});
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    serviceLogsMock = jest.spyOn(DockerComposeService.prototype, "logs");
    serviceDownMock = jest.spyOn(DockerComposeService.prototype, "down");
  });

  it("calls run when imported", async () => {
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
    serviceDownMock.mockResolvedValueOnce();

    await import("./post.js");
    await new Promise((resolve) => setTimeout(resolve, 0));

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

    expect(debugMock).toHaveBeenNthCalledWith(1, "docker compose logs:\ntest logs");
    expect(infoMock).toHaveBeenNthCalledWith(1, "docker compose is down");

    expect(setFailedMock).not.toHaveBeenCalled();
  });
});
