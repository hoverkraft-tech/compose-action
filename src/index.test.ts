import * as core from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import { DockerComposeInstallerService } from "./services/docker-compose-installer.service";

let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let getInputsMock: jest.SpiedFunction<typeof InputService.prototype.getInputs>;
let debugMock: jest.SpiedFunction<typeof LoggerService.prototype.debug>;
let infoMock: jest.SpiedFunction<typeof LoggerService.prototype.info>;
let installMock: jest.SpiedFunction<typeof DockerComposeInstallerService.prototype.install>;
let upMock: jest.SpiedFunction<typeof DockerComposeService.prototype.up>;

describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    infoMock = jest.spyOn(LoggerService.prototype, "info").mockImplementation();
    debugMock = jest.spyOn(LoggerService.prototype, "debug").mockImplementation();
    getInputsMock = jest.spyOn(InputService.prototype, "getInputs");
    installMock = jest.spyOn(DockerComposeInstallerService.prototype, "install");
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
      composeVersion: null,
      githubToken: null,
    }));

    installMock.mockResolvedValue("1.2.3");
    upMock.mockResolvedValueOnce();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require("../src/index");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(infoMock).toHaveBeenNthCalledWith(1, "Setting up docker compose");
    expect(infoMock).toHaveBeenNthCalledWith(2, "docker compose version: 1.2.3");

    // Verify that all of the functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'inputs: {"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":null,"githubToken":null}'
    );

    expect(infoMock).toHaveBeenNthCalledWith(3, "Bringing up docker compose service(s)");

    expect(upMock).toHaveBeenCalledWith({
      composeFiles: ["docker-compose.yml"],
      services: [],
      composeFlags: [],
      upFlags: [],
      cwd: "/current/working/dir",
      debug: debugMock,
    });

    expect(setFailedMock).not.toHaveBeenCalled();

    expect(infoMock).toHaveBeenNthCalledWith(4, "docker compose service(s) are up");
  });
});
