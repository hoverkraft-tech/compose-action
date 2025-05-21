import * as core from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService, LogLevel } from "./services/logger.service";

let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let logsMock: jest.SpiedFunction<typeof DockerComposeService.prototype.logs>;
let downMock: jest.SpiedFunction<typeof DockerComposeService.prototype.down>;

describe("post", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    logsMock = jest.spyOn(DockerComposeService.prototype, "logs");
    downMock = jest.spyOn(DockerComposeService.prototype, "down");
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

    logsMock.mockResolvedValue({ error: "", output: "test logs" });
    downMock.mockResolvedValueOnce();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require("../src/post");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(logsMock).toHaveBeenCalledWith({
      dockerFlags: [],
      composeFiles: ["docker-compose.yml"],
      composeFlags: [],
      cwd: "/current/working/dir",
      services: [],
      serviceLogger: debugMock,
    });

    expect(downMock).toHaveBeenCalledWith({
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
