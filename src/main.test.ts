/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import * as main from "./main";

// Mock the action's main function
const runMock = jest.spyOn(main, "run");

// Mock the external libraries and services used by the action
let debugMock: jest.SpiedFunction<typeof core.debug>;
let warnMock: jest.SpiedFunction<typeof LoggerService.prototype.warn>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;
let downMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;

describe("run", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    debugMock = jest.spyOn(core, "debug").mockImplementation();
    warnMock = jest.spyOn(LoggerService.prototype, "warn").mockImplementation();
    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    upMock = jest.spyOn(DockerComposeService.prototype, "up");
    downMock = jest.spyOn(DockerComposeService.prototype, "down");
  });

  it("should return and warns when composeFile is empty", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: [],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    await main.run(main.RunAction.UP);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":[],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );
    expect(warnMock).toHaveBeenNthCalledWith(1, "no compose files found");
    expect(upMock).not.toHaveBeenCalled();
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("should call up when some compose files are provided", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    upMock.mockResolvedValueOnce();

    await main.run(main.RunAction.UP);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );

    expect(upMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    });

    expect(setFailedMock).not.toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalledWith("compose started");
  });

  it("sets a failed status", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    upMock.mockRejectedValueOnce(new Error("unkown error"));

    await main.run(main.RunAction.UP);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, "compose up failed. Error: unkown error");
  });

  it("should call down when some compose files are provided", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    downMock.mockResolvedValueOnce();

    await main.run(main.RunAction.DOWN);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );

    expect(downMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    });

    expect(setFailedMock).not.toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalledWith("compose removed");
  });
});
