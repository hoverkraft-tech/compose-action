import * as dockerCompose from "docker-compose";
import { DockerComposeService, DownInputs, LogsInputs, UpInputs } from "./docker-compose.service";

jest.mock("docker-compose");

describe("DockerComposeService", () => {
  let service: DockerComposeService;
  let upAllMock: jest.SpiedFunction<typeof dockerCompose.upAll>;
  let upManyMock: jest.SpiedFunction<typeof dockerCompose.upMany>;
  let downMock: jest.SpiedFunction<typeof dockerCompose.down>;
  let logsMock: jest.SpiedFunction<typeof dockerCompose.logs>;

  beforeEach(() => {
    service = new DockerComposeService();
    upAllMock = jest.spyOn(dockerCompose, "upAll").mockImplementation();
    upManyMock = jest.spyOn(dockerCompose, "upMany").mockImplementation();
    downMock = jest.spyOn(dockerCompose, "down").mockImplementation();
    logsMock = jest.spyOn(dockerCompose, "logs").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("up", () => {
    it("should call up with correct options", async () => {
      const upInputs: UpInputs = {
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        cwd: "/current/working/dir",
        debug: jest.fn(),
      };

      await service.up(upInputs);

      expect(upAllMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: [],
        config: ["docker-compose.yml"],
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });
    });

    it("should call up with specific services", async () => {
      const upInputs: UpInputs = {
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        upFlags: ["--build"],
        cwd: "/current/working/dir",
        debug: jest.fn(),
      };

      await service.up(upInputs);

      expect(upManyMock).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        commandOptions: ["--build"],
        config: ["docker-compose.yml"],
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });
    });
  });

  describe("down", () => {
    it("should call down with correct options", async () => {
      const downInputs: DownInputs = {
        composeFiles: [],
        composeFlags: [],
        downFlags: ["--volumes", "--remove-orphans"],
        cwd: "/current/working/dir",
        debug: jest.fn(),
      };

      await service.down(downInputs);

      expect(downMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: ["--volumes", "--remove-orphans"],
        config: [],
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });
    });
  });

  describe("logs", () => {
    it("should call logs with correct options", async () => {
      const debugMock = jest.fn();
      const logsInputs: LogsInputs = {
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        cwd: "/current/working/dir",
        debug: debugMock,
      };

      logsMock.mockResolvedValue({ exitCode: 0, err: "", out: "logs" });

      await service.logs(logsInputs);

      expect(dockerCompose.logs).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        config: ["docker-compose.yml"],
        cwd: "/current/working/dir",
        follow: false,
        callback: expect.any(Function),
      });
    });
  });
});
