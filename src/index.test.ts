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
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import("./services/logger.service.js");
const { DockerComposeInstallerService } = await import(
  "./services/docker-compose-installer.service.js"
);
const { DockerComposeService } = await import("./services/docker-compose.service.js");

let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let installMock: jest.SpiedFunction<typeof DockerComposeInstallerService.prototype.install>;
let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;

describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation(() => {});
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation(() => {});
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    installMock = jest.spyOn(DockerComposeInstallerService.prototype, "install");
    upMock = jest.spyOn(DockerComposeService.prototype, "up");
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

    installMock.mockResolvedValue("1.2.3");
    upMock.mockResolvedValueOnce();

    await import("./index.js");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(infoMock).toHaveBeenNthCalledWith(1, "Setting up docker compose");
    expect(infoMock).toHaveBeenNthCalledWith(2, "docker compose version: 1.2.3");

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"dockerFlags":[],"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":null,"githubToken":null,"serviceLogLevel":"debug"}'
    );

    expect(infoMock).toHaveBeenNthCalledWith(3, "Bringing up docker compose service(s)");

    expect(upMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      cwd: "/current/working/dir",
      serviceLogger: debugMock,
    });

    expect(setFailedMock).not.toHaveBeenCalled();

    expect(infoMock).toHaveBeenNthCalledWith(4, "docker compose service(s) are up");
  });
});
