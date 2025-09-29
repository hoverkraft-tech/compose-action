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
        dockerFlags: [],
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      await service.up(upInputs);

      expect(upAllMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: [],
        config: ["docker-compose.yml"],
        executable: {
          executablePath: "docker",
          options: [],
        },
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });

      // Ensure callback is calling the service logger
      const callback = upAllMock?.mock?.calls[0][0]?.callback;
      expect(callback).toBeDefined();

      const message = "test log output";

      if (callback) {
        callback(Buffer.from(message));
      }

      expect(upInputs.serviceLogger).toHaveBeenCalledWith("test log output");
    });

    it("should call up with specific docker flags", async () => {
      const upInputs: UpInputs = {
        dockerFlags: ["--context", "dev"],
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      await service.up(upInputs);

      expect(upAllMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: [],
        config: ["docker-compose.yml"],
        executable: {
          executablePath: "docker",
          options: ["--context", "dev"],
        },
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });
    });

    it("should call up with specific services", async () => {
      const upInputs: UpInputs = {
        dockerFlags: [],
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        upFlags: ["--build"],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      await service.up(upInputs);

      expect(upManyMock).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        commandOptions: ["--build"],
        config: ["docker-compose.yml"],
        cwd: "/current/working/dir",
        callback: expect.any(Function),
        executable: {
          executablePath: "docker",
          options: [],
        },
      });
    });
  });

  describe("down", () => {
    it("should call down with correct options", async () => {
      const downInputs: DownInputs = {
        dockerFlags: [],
        composeFiles: [],
        composeFlags: [],
        downFlags: ["--volumes", "--remove-orphans"],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      await service.down(downInputs);

      expect(downMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: ["--volumes", "--remove-orphans"],
        config: [],
        executable: {
          executablePath: "docker",
          options: [],
        },
        cwd: "/current/working/dir",
        callback: expect.any(Function),
      });
    });
  });

  describe("logs", () => {
    it("should call logs with correct options", async () => {
      const debugMock = jest.fn();
      const logsInputs: LogsInputs = {
        dockerFlags: [],
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        cwd: "/current/working/dir",
        serviceLogger: debugMock,
      };

      logsMock.mockResolvedValue({ exitCode: 0, err: "", out: "logs" });

      await service.logs(logsInputs);

      expect(dockerCompose.logs).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        config: ["docker-compose.yml"],
        cwd: "/current/working/dir",
        executable: {
          executablePath: "docker",
          options: [],
        },
        follow: false,
        callback: expect.any(Function),
      });
    });
  });
});
