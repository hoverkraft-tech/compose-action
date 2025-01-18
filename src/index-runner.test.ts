import * as core from "@actions/core";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import { DockerComposeInstallerService } from "./services/docker-compose-installer.service";
import * as indexRunner from "./index-runner";
import { DockerComposeService } from "./services/docker-compose.service";

describe("run", () => {
  // Mock the external libraries and services used by the action
  let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
  let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
  let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
  let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
  let installMock: jest.SpiedFunction<typeof DockerComposeInstallerService.prototype.install>;
  let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;

  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    installMock = jest.spyOn(DockerComposeInstallerService.prototype, "install");
    upMock = jest.spyOn(DockerComposeService.prototype, "up");
  });

  it("should install docker compose with specified version", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: "1.29.2",
      githubToken: null,
    }));

    installMock.mockResolvedValue("1.29.2");

    upMock.mockResolvedValue();

    // Act
    await indexRunner.run();

    // Assert
    expect(infoMock).toHaveBeenCalledWith("Setting up docker compose version 1.29.2");

    expect(debugMock).toHaveBeenCalledWith(
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":"1.29.2","githubToken":null}'
    );

    expect(installMock).toHaveBeenCalledWith({
      composeVersion: "1.29.2",
      cwd: "/current/working/dir",
      githubToken: null,
    });

    expect(upMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      upFlags: [],
      services: [],
    });

    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should bring up docker compose services", async () => {
    // Arrange
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: ["web"],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
    }));

    // Act
    await indexRunner.run();

    // Assert
    expect(upMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      upFlags: [],
      services: ["web"],
    });
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should handle errors and call setFailed", async () => {
    // Arrange
    const error = new Error("Test error");
    upMock.mockRejectedValue(error);

    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: ["web"],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
    }));

    // Act
    await indexRunner.run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith("Error: Test error");
  });

  it("should handle unknown errors and call setFailed", async () => {
    // Arrange
    const error = "Test error";
    upMock.mockRejectedValue(error);

    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: ["web"],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
      composeVersion: null,
      githubToken: null,
    }));

    // Act
    await indexRunner.run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith('"Test error"');
  });
});
