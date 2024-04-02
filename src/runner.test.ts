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
import * as runner from "./runner";

// Mock the action's main function
const runMock = jest.spyOn(runner, "run");

// Mock the external libraries and services used by the action
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let warnMock: jest.SpiedFunction<typeof LoggerService.prototype.warn>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
describe("run", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    warnMock = jest.spyOn(LoggerService.prototype, "warn").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
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

    const callbackMock = jest.fn();

    await runner.run(callbackMock);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":[],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );
    expect(warnMock).toHaveBeenNthCalledWith(1, "no compose files found");
    expect(callbackMock).not.toHaveBeenCalled();
    expect(setFailedMock).not.toHaveBeenCalled();
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

    const callbackMock = jest.fn();
    callbackMock.mockRejectedValueOnce(new Error("unkown error"));

    await runner.run(callbackMock);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(callbackMock).toHaveBeenCalled();
    expect(setFailedMock).toHaveBeenNthCalledWith(1, "Error: unkown error");
  });

  it("should call callback when some compose files are provided", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    const callbackMock = jest.fn();
    callbackMock.mockResolvedValueOnce(null);

    await runner.run(callbackMock);
    expect(runMock).toHaveReturned();

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );

    expect(callbackMock).toHaveBeenCalledWith(
      {
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        downFlags: [],
        cwd: "/current/working/dir",
      },
      expect.any(LoggerService),
      expect.any(DockerComposeService)
    );

    expect(setFailedMock).not.toHaveBeenCalled();
  });
});
