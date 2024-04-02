import { v2 } from "docker-compose";
import { DockerComposeService } from "./docker-compose.service";
import { Inputs } from "./input.service";

jest.mock("docker-compose");

describe("DockerComposeService", () => {
  let service: DockerComposeService;
  let upAllMock: jest.SpiedFunction<typeof v2.upAll>;
  let upManyMock: jest.SpiedFunction<typeof v2.upMany>;
  let downMock: jest.SpiedFunction<typeof v2.down>;

  beforeEach(() => {
    service = new DockerComposeService();
    upAllMock = jest.spyOn(v2, "upAll").mockImplementation();
    upManyMock = jest.spyOn(v2, "upMany").mockImplementation();
    downMock = jest.spyOn(v2, "down").mockImplementation();
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
});
