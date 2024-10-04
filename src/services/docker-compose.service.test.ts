import * as dockerCompose from "docker-compose";
import { DockerComposeService } from "./docker-compose.service";
import { Inputs } from "./input.service";

jest.mock("docker-compose");

describe("DockerComposeService", () => {
  let service: DockerComposeService;
  let upAllMock: jest.SpiedFunction<typeof dockerCompose.upAll>;
  let upManyMock: jest.SpiedFunction<typeof dockerCompose.upMany>;
  let downMock: jest.SpiedFunction<typeof dockerCompose.down>;
  let logsMock: jest.SpiedFunction<typeof dockerCompose.logs>;
  let versionMock: jest.SpiedFunction<typeof dockerCompose.version>;

  beforeEach(() => {
    service = new DockerComposeService();
    upAllMock = jest.spyOn(dockerCompose, "upAll").mockImplementation();
    upManyMock = jest.spyOn(dockerCompose, "upMany").mockImplementation();
    downMock = jest.spyOn(dockerCompose, "down").mockImplementation();
    logsMock = jest.spyOn(dockerCompose, "logs").mockImplementation();
    versionMock = jest.spyOn(dockerCompose, "version").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("up", () => {
    it("should call up with correct options", async () => {
      const inputs: Inputs = {
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        downFlags: [],
        cwd: "/current/working/dir",
      };

      await service.up(inputs);

      expect(upAllMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: [],
        config: ["docker-compose.yml"],
        log: true,
        cwd: "/current/working/dir",
      });
    });

    it("should call up with specific services", async () => {
      const inputs: Inputs = {
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        upFlags: ["--build"],
        downFlags: [],
        cwd: "/current/working/dir",
      };

      await service.up(inputs);

      expect(upManyMock).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        commandOptions: ["--build"],
        config: ["docker-compose.yml"],
        log: true,
        cwd: "/current/working/dir",
      });
    });
  });

  describe("down", () => {
    it("should call down with correct options", async () => {
      const inputs: Inputs = {
        composeFiles: [],
        services: [],
        composeFlags: [],
        upFlags: [],
        downFlags: ["--volumes", "--remove-orphans"],
        cwd: "/current/working/dir",
      };

      await service.down(inputs);

      expect(downMock).toHaveBeenCalledWith({
        composeOptions: [],
        commandOptions: ["--volumes", "--remove-orphans"],
        config: [],
        log: true,
        cwd: "/current/working/dir",
      });
    });
  });

  describe("logs", () => {
    it("should call logs with correct options", async () => {
      const inputs: Inputs = {
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [],
        upFlags: [],
        downFlags: [],
        cwd: "/current/working/dir",
      };

      logsMock.mockResolvedValue({ exitCode: 0, err: "", out: "logs" });

      await service.logs(inputs);

      expect(dockerCompose.logs).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
        composeOptions: [],
        config: ["docker-compose.yml"],
        log: true,
        cwd: "/current/working/dir",
        follow: false,
      });
    });
  });

  describe("version", () => {
    it("should call version with correct options", async () => {
      const inputs: Inputs = {
        composeFiles: ["docker-compose.yml"],
        services: [],
        composeFlags: [],
        upFlags: [],
        downFlags: [],
        cwd: "/current/working/dir",
      };

      versionMock.mockResolvedValue({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      await service.version(inputs);

      expect(versionMock).toHaveBeenCalledWith({
        composeOptions: [],
        config: ["docker-compose.yml"],
        log: true,
        cwd: "/current/working/dir",
      });
    });
  });
});
