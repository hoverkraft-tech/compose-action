import * as core from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";

let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let versionMock: jest.SpiedFunction<typeof DockerComposeService.prototype.version>;
let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;

describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    versionMock = jest.spyOn(DockerComposeService.prototype, "version");
    upMock = jest.spyOn(DockerComposeService.prototype, "up");
  });

  it("calls run when imported", async () => {
    getInputsMock.mockImplementation(() => ({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    }));

    versionMock.mockResolvedValueOnce("1.2.3");
    upMock.mockResolvedValueOnce();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require("../src/index");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(infoMock).toHaveBeenNthCalledWith(1, "docker-compose version: 1.2.3");

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
    expect(infoMock).toHaveBeenNthCalledWith(2, "docker-compose is up");
  });
});
