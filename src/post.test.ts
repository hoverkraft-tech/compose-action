import * as core from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";

let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let downMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;
let logsMock: jest.SpiedFunction<typeof DockerComposeService.prototype.logs>;

describe("post", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    downMock = jest.spyOn(DockerComposeService.prototype, "down");
    logsMock = jest.spyOn(DockerComposeService.prototype, "logs");
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

    logsMock.mockResolvedValueOnce({ error: "", output: "log" });
    downMock.mockResolvedValueOnce();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require("../src/post");
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir"}'
    );

    expect(logsMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    });

    expect(debugMock).toHaveBeenNthCalledWith(2, "docker-compose logs:\nlog");

    expect(downMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      downFlags: [],
      cwd: "/current/working/dir",
    });

    expect(setFailedMock).not.toHaveBeenCalled();
    expect(infoMock).toHaveBeenCalledWith("docker-compose is down");
  });
});
