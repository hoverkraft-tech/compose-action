import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { ExecOptions } from "@actions/exec";

// Mock @actions/exec
const execMock =
  jest.fn<(command: string, args?: string[], options?: ExecOptions) => Promise<number>>();

jest.unstable_mockModule("@actions/exec", () => ({
  exec: execMock,
}));

// Mock @actions/io
const mkdirPMock = jest.fn<(fsPath: string) => Promise<void>>();

jest.unstable_mockModule("@actions/io", () => ({
  mkdirP: mkdirPMock,
}));

// Mock @actions/tool-cache
const cacheFileMock = jest.fn<() => Promise<string>>();
const downloadToolMock = jest.fn<() => Promise<string>>();

jest.unstable_mockModule("@actions/tool-cache", () => ({
  cacheFile: cacheFileMock,
  downloadTool: downloadToolMock,
}));

// Dynamic import after mock setup
const { ManualInstallerAdapter } = await import("./manual-installer-adapter.js");

describe("ManualInstallerAdapter", () => {
  let adapter: InstanceType<typeof ManualInstallerAdapter>;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DOCKER_CONFIG;
    adapter = new ManualInstallerAdapter();
  });

  describe("install", () => {
    it("should install docker compose correctly", async () => {
      // Arrange
      const version = "v2.29.0";

      // Uname -s
      execMock.mockResolvedValueOnce(0);

      // Uname -m
      execMock.mockResolvedValueOnce(0);

      Object.defineProperty(process.env, "HOME", {
        value: "/home/test",
      });

      // Act
      await adapter.install(version);

      // Assert
      expect(mkdirPMock).toHaveBeenCalledWith("docker-compose");
      expect(execMock).toHaveBeenNthCalledWith(1, "uname -s", [], {
        listeners: { stdout: expect.any(Function) },
      });
      expect(execMock).toHaveBeenNthCalledWith(2, "uname -m", [], {
        listeners: { stdout: expect.any(Function) },
      });

      expect(downloadToolMock).toHaveBeenCalledWith(
        "https://github.com/docker/compose/releases/download/v2.29.0/docker-compose--",
        "/home/test/.docker/cli-plugins/docker-compose"
      );

      expect(cacheFileMock).toHaveBeenCalledWith(
        "/home/test/.docker/cli-plugins/docker-compose",
        "docker-compose",
        "docker-compose",
        version
      );
    });

    it("should use DOCKER_CONFIG when set", async () => {
      // Arrange
      const version = "v2.29.0";

      execMock.mockImplementationOnce(async (_command, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from("Linux\n"));
        return 0;
      });

      execMock.mockImplementationOnce(async (_command, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from("x86_64\n"));
        return 0;
      });

      process.env.DOCKER_CONFIG = "/custom/docker";

      // Act
      await adapter.install(version);

      // Assert
      expect(downloadToolMock).toHaveBeenCalledWith(
        "https://github.com/docker/compose/releases/download/v2.29.0/docker-compose-Linux-x86_64",
        "/custom/docker/cli-plugins/docker-compose"
      );
    });

    it("should handle version without 'v' prefix", async () => {
      // Arrange
      const version = "2.29.0";

      // Uname -s
      execMock.mockResolvedValueOnce(0);

      // Uname -m
      execMock.mockResolvedValueOnce(0);

      Object.defineProperty(process.env, "HOME", {
        value: "/home/test",
      });

      // Act
      await adapter.install(version);

      // Assert
      expect(mkdirPMock).toHaveBeenCalledWith("docker-compose");
      expect(execMock).toHaveBeenNthCalledWith(1, "uname -s", [], {
        listeners: { stdout: expect.any(Function) },
      });
      expect(execMock).toHaveBeenNthCalledWith(2, "uname -m", [], {
        listeners: { stdout: expect.any(Function) },
      });

      expect(downloadToolMock).toHaveBeenCalledWith(
        "https://github.com/docker/compose/releases/download/v2.29.0/docker-compose--",
        "/home/test/.docker/cli-plugins/docker-compose"
      );
    });

    it("should not add 'v' prefix for 1.x versions", async () => {
      // Arrange
      const version = "1.29.0";

      execMock.mockImplementationOnce(async (_command, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from("Linux\n"));
        return 0;
      });

      execMock.mockImplementationOnce(async (_command, _args, options) => {
        options?.listeners?.stdout?.(Buffer.from("x86_64\n"));
        return 0;
      });

      delete process.env.DOCKER_CONFIG;
      Object.defineProperty(process.env, "HOME", {
        value: "/home/test",
      });

      // Act
      await adapter.install(version);

      // Assert
      expect(downloadToolMock).toHaveBeenCalledWith(
        "https://github.com/docker/compose/releases/download/1.29.0/docker-compose-Linux-x86_64",
        "/home/test/.docker/cli-plugins/docker-compose"
      );
    });

    it("should throw an error if a command fails", async () => {
      // Arrange
      const version = "v2.29.0";

      // Uname -s
      execMock.mockResolvedValueOnce(1);

      // Act
      await expect(adapter.install(version)).rejects.toThrow("Failed to run command: uname -s");

      // Assert
      expect(execMock).toHaveBeenNthCalledWith(1, "uname -s", [], {
        listeners: { stdout: expect.any(Function) },
      });
    });
  });
});
