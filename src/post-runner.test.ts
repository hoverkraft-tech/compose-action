import * as core from "@actions/core";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import * as postRunner from "./post-runner";
import { DockerComposeService } from "./services/docker-compose.service";

// Mock the external libraries and services used by the action
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let downMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;
let logsMock: jest.SpiedFunction<typeof DockerComposeService.prototype.logs>;

describe("run", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    downMock = jest.spyOn(DockerComposeService.prototype, "down");
    logsMock = jest.spyOn(DockerComposeService.prototype, "logs");
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
    }));

    logsMock.mockResolvedValue({ error: "", output: "test logs" });

    downMock.mockResolvedValue();

    // Act
    await postRunner.run();

    // Assert
    expect(logsMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      services: [],
      debug: debugMock,
    });

    expect(downMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      downFlags: [],
      debug: debugMock,
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
    }));

    logsMock.mockResolvedValue({
      error: "test logs error",
      output: "test logs output",
    });

    downMock.mockResolvedValue();

    // Act
    await postRunner.run();

    // Assert
    expect(logsMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      dockerFlags: [],
      services: [],
      debug: debugMock,
    });

    expect(downMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      dockerFlags: [],
      downFlags: [],
      debug: debugMock,
    });

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
    await postRunner.run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith("Error: An error occurred");
  });

  it("should handle errors and call setFailed", async () => {
    // Arrange
    const error = new Error("Test error");
    downMock.mockRejectedValue(error);

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
    }));

    // Act
    await postRunner.run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith("Error: Test error");
  });

  it("should handle unknown errors and call setFailed", async () => {
    // Arrange
    const error = "Test error";
    downMock.mockRejectedValue(error);

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
    }));

    // Act
    await postRunner.run();

    // Assert
    expect(setFailedMock).toHaveBeenCalledWith('"Test error"');
  });
});
