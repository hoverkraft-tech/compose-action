import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { IDockerComposeOptions, IDockerComposeResult } from "docker-compose";

// Mock docker-compose before importing the module under test
const upAllMock = jest.fn<(options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();
const upManyMock =
  jest.fn<(services: string[], options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();
const downMock = jest.fn<(options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();
const logsMock =
  jest.fn<(services: string[], options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();

jest.unstable_mockModule("docker-compose", () => ({
  upAll: upAllMock,
  upMany: upManyMock,
  down: downMock,
  logs: logsMock,
}));

// Dynamic import after mock setup
const { DockerComposeService } = await import("./docker-compose.service.js");

describe("DockerComposeService", () => {
  let service: InstanceType<typeof DockerComposeService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DockerComposeService();
  });

  describe("up", () => {
    it("should call up with correct options", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      upAllMock.mockResolvedValue({ exitCode: 0, err: "", out: "" });

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
      const callback = (upAllMock.mock.calls[0][0] as IDockerComposeOptions)?.callback;
      expect(callback).toBeDefined();

      const message = "test log output";

      if (callback) {
        callback(Buffer.from(message));
      }

      expect(upInputs.serviceLogger).toHaveBeenCalledWith("test log output");
    });

    it("should call up with specific docker flags", async () => {
      const upInputs = {
        dockerFlags: ["--context", "dev"],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      upAllMock.mockResolvedValue({ exitCode: 0, err: "", out: "" });

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
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [] as string[],
        upFlags: ["--build"],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      upManyMock.mockResolvedValue({ exitCode: 0, err: "", out: "" });

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

    it("should throw formatted error when upAll fails with docker-compose result", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Error: unable to pull image\nfailed to resolve reference",
        out: "",
      };

      upAllMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1"
      );
      await expect(service.up(upInputs)).rejects.toThrow("unable to pull image");
    });

    it("should throw formatted error when upMany fails with docker-compose result", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: ["web"],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Service 'web' failed to start",
        out: "Starting web...",
      };

      upManyMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1"
      );
      await expect(service.up(upInputs)).rejects.toThrow("Service 'web' failed to start");
      await expect(service.up(upInputs)).rejects.toThrow("Starting web...");
    });

    it("should pass through docker-compose result without exit code", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const dockerComposeError = {
        exitCode: null,
        err: "Some error without exit code",
        out: "",
      };

      upAllMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow("Some error without exit code");
    });

    it("should pass through standard Error objects", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const standardError = new Error("Standard error message");
      upAllMock.mockRejectedValue(standardError);

      await expect(service.up(upInputs)).rejects.toThrow("Standard error message");
    });

    it("should pass through error strings", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const unknownError = "Some unknown error";
      upAllMock.mockRejectedValue(unknownError);

      await expect(service.up(upInputs)).rejects.toThrow("Some unknown error");
    });

    it("should handle unknown error types gracefully", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const unknownError = { unexpected: "error format" };
      upAllMock.mockRejectedValue(unknownError);

      await expect(service.up(upInputs)).rejects.toThrow(JSON.stringify(unknownError));
    });
  });

  describe("down", () => {
    it("should call down with correct options", async () => {
      const downInputs = {
        dockerFlags: [] as string[],
        composeFiles: [] as string[],
        composeFlags: [] as string[],
        downFlags: ["--volumes", "--remove-orphans"],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      downMock.mockResolvedValue({ exitCode: 0, err: "", out: "" });

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

    it("should throw formatted error when down fails with docker-compose result", async () => {
      const downInputs = {
        dockerFlags: [] as string[],
        composeFiles: [] as string[],
        composeFlags: [] as string[],
        downFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: jest.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Error stopping containers",
        out: "",
      };

      downMock.mockRejectedValue(dockerComposeError);

      await expect(service.down(downInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1"
      );
      await expect(service.down(downInputs)).rejects.toThrow("Error stopping containers");
    });
  });

  describe("logs", () => {
    it("should call logs with correct options", async () => {
      const debugMock = jest.fn();
      const logsInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: debugMock,
      };

      logsMock.mockResolvedValue({ exitCode: 0, err: "", out: "logs" });

      await service.logs(logsInputs);

      expect(logsMock).toHaveBeenCalledWith(["helloworld2", "helloworld3"], {
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
