import { EventEmitter } from "node:events";
import type {
  IDockerComposeOptions,
  IDockerComposeResult,
} from "docker-compose";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock docker-compose before importing the module under test
const upAllMock =
  vi.fn<(options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();
const upManyMock =
  vi.fn<
    (
      services: string[],
      options: IDockerComposeOptions,
    ) => Promise<IDockerComposeResult>
  >();
const downMock =
  vi.fn<(options: IDockerComposeOptions) => Promise<IDockerComposeResult>>();
const spawnMock = vi.fn();

vi.doMock("docker-compose", () => ({
  upAll: upAllMock,
  upMany: upManyMock,
  down: downMock,
}));

vi.doMock("node:child_process", () => ({
  spawn: spawnMock,
}));

// Dynamic import after mock setup
const { DockerComposeService } = await import("./docker-compose.service.js");

describe("DockerComposeService", () => {
  let service: InstanceType<typeof DockerComposeService>;

  beforeEach(() => {
    vi.clearAllMocks();
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
        serviceLogger: vi.fn(),
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
      const callback = (upAllMock.mock.calls[0][0] as IDockerComposeOptions)
        ?.callback;
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
        serviceLogger: vi.fn(),
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
        serviceLogger: vi.fn(),
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
        serviceLogger: vi.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Error: unable to pull image\nfailed to resolve reference",
        out: "",
      };

      upAllMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1",
      );
      await expect(service.up(upInputs)).rejects.toThrow(
        "unable to pull image",
      );
    });

    it("should throw formatted error when upMany fails with docker-compose result", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: ["web"],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Service 'web' failed to start",
        out: "Starting web...",
      };

      upManyMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1",
      );
      await expect(service.up(upInputs)).rejects.toThrow(
        "Service 'web' failed to start",
      );
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
        serviceLogger: vi.fn(),
      };

      const dockerComposeError = {
        exitCode: null,
        err: "Some error without exit code",
        out: "",
      };

      upAllMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Some error without exit code",
      );
    });

    it("should format docker-compose result when streams are undefined", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: undefined,
        out: undefined,
      };

      upAllMock.mockRejectedValue(dockerComposeError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1",
      );
      await expect(service.up(upInputs)).rejects.not.toThrow("Error output:");
      await expect(service.up(upInputs)).rejects.not.toThrow(
        "Standard output:",
      );
    });

    it("should pass through standard Error objects", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const standardError = new Error("Standard error message");
      upAllMock.mockRejectedValue(standardError);

      await expect(service.up(upInputs)).rejects.toThrow(
        "Standard error message",
      );
    });

    it("should pass through error strings", async () => {
      const upInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"],
        services: [] as string[],
        composeFlags: [] as string[],
        upFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
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
        serviceLogger: vi.fn(),
      };

      const unknownError = { unexpected: "error format" };
      upAllMock.mockRejectedValue(unknownError);

      await expect(service.up(upInputs)).rejects.toThrow(
        JSON.stringify(unknownError),
      );
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
        serviceLogger: vi.fn(),
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
        serviceLogger: vi.fn(),
      };

      const dockerComposeError = {
        exitCode: 1,
        err: "Error stopping containers",
        out: "",
      };

      downMock.mockRejectedValue(dockerComposeError);

      await expect(service.down(downInputs)).rejects.toThrow(
        "Docker Compose command failed with exit code 1",
      );
      await expect(service.down(downInputs)).rejects.toThrow(
        "Error stopping containers",
      );
    });
  });

  describe("logs", () => {
    it("should stream logs with wrapper-compatible command arguments", async () => {
      const debugMock = vi.fn();
      const logsInputs = {
        dockerFlags: ["--context", "dev"] as string[],
        composeFiles: ["docker-compose.yml"],
        services: ["helloworld2", "helloworld3"],
        composeFlags: ["--profile", "ci"] as string[],
        cwd: "/current/working/dir",
        serviceLogger: debugMock,
      };

      const stdout = new EventEmitter();
      const stderr = new EventEmitter();
      const childProcess = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      childProcess.stdout = stdout;
      childProcess.stderr = stderr;
      spawnMock.mockReturnValue(childProcess);

      const logsPromise = service.logs(logsInputs);

      expect(spawnMock).toHaveBeenCalledWith(
        "docker",
        [
          "--context",
          "dev",
          "compose",
          "--profile",
          "ci",
          "-f",
          "docker-compose.yml",
          "logs",
          "helloworld2",
          "helloworld3",
        ],
        {
          cwd: "/current/working/dir",
        },
      );

      stdout.emit("data", Buffer.from("logs"));
      stderr.emit("data", Buffer.from("error logs"));
      childProcess.emit("close", 0);

      await expect(logsPromise).resolves.toEqual({ error: "", output: "" });

      expect(debugMock).toHaveBeenNthCalledWith(1, "logs");
      expect(debugMock).toHaveBeenNthCalledWith(2, "error logs");
    });

    it("should return a non-fatal error message when logs command fails", async () => {
      const logsInputs = {
        dockerFlags: ["--context", "dev"] as string[],
        composeFiles: ["docker-compose.yml"] as string[],
        services: [] as string[],
        composeFlags: ["--profile", "ci"] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const childProcess = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      childProcess.stdout = new EventEmitter();
      childProcess.stderr = new EventEmitter();
      spawnMock.mockReturnValue(childProcess);

      const logsPromise = service.logs(logsInputs);

      childProcess.emit("close", 1);

      await expect(logsPromise).resolves.toEqual({
        error: "Docker Compose logs command failed with exit code 1",
        output: "",
      });
    });

    it("should return a non-fatal error message when logs command is terminated by a signal", async () => {
      const logsInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"] as string[],
        services: [] as string[],
        composeFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const childProcess = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      childProcess.stdout = new EventEmitter();
      childProcess.stderr = new EventEmitter();
      spawnMock.mockReturnValue(childProcess);

      const logsPromise = service.logs(logsInputs);

      childProcess.emit("close", null, "SIGTERM");

      await expect(logsPromise).resolves.toEqual({
        error: "Docker Compose logs command failed with signal SIGTERM",
        output: "",
      });
    });

    it("should return a non-fatal error message when spawning logs fails", async () => {
      const logsInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"] as string[],
        services: [] as string[],
        composeFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const childProcess = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      childProcess.stdout = new EventEmitter();
      childProcess.stderr = new EventEmitter();
      spawnMock.mockReturnValue(childProcess);

      const logsPromise = service.logs(logsInputs);

      childProcess.emit("error", new Error("spawn ENOENT"));

      await expect(logsPromise).resolves.toEqual({
        error: "Unable to collect docker compose logs: spawn ENOENT",
        output: "",
      });
    });

    it("should return a non-fatal error message when output streams are unavailable", async () => {
      const logsInputs = {
        dockerFlags: [] as string[],
        composeFiles: ["docker-compose.yml"] as string[],
        services: [] as string[],
        composeFlags: [] as string[],
        cwd: "/current/working/dir",
        serviceLogger: vi.fn(),
      };

      const childProcess = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter | null;
        stderr: EventEmitter | null;
      };
      childProcess.stdout = null;
      childProcess.stderr = null;
      spawnMock.mockReturnValue(childProcess);

      await expect(service.logs(logsInputs)).resolves.toEqual({
        error:
          "Unable to collect docker compose logs: stdout/stderr unavailable",
        output: "",
      });
    });
  });
});
