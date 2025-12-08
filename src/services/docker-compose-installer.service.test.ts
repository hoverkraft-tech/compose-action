import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { IDockerComposeResult } from "docker-compose";
import { MockAgent, setGlobalDispatcher } from "undici";

// Mock docker-compose before importing the module under test
const versionMock = jest.fn<() => Promise<IDockerComposeResult & { data: { version: string } }>>();

jest.unstable_mockModule("docker-compose", () => ({
  version: versionMock,
}));

// Create manual installer adapter mock
const manualInstallerAdapterMock = {
  install: jest.fn<(version: string) => Promise<void>>(),
};

// Dynamic import after mock setup
const { DockerComposeInstallerService } = await import("./docker-compose-installer.service.js");

describe("DockerComposeInstallerService", () => {
  let mockAgent: MockAgent;
  let service: InstanceType<typeof DockerComposeInstallerService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();

    service = new DockerComposeInstallerService(manualInstallerAdapterMock as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("install", () => {
    it("should return current version when no version is provided", async () => {
      // Arrange
      versionMock.mockResolvedValue({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "2.0.0",
        },
      });

      // Act
      const result = await service.install({
        composeVersion: null,
        cwd: "/path/to/cwd",
        githubToken: null,
      });

      // Assert
      expect(result).toBe("2.0.0");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should not install anything when expected version is already installed", async () => {
      // Arrange
      versionMock.mockResolvedValue({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      // Act
      const result = await service.install({
        composeVersion: "1.2.3",
        cwd: "/path/to/cwd",
        githubToken: null,
      });

      // Assert
      expect(result).toBe("1.2.3");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should install the requested version if it is not already installed", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      const expectedVersion = "1.3.0";
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: expectedVersion,
        },
      });

      Object.defineProperty(process, "platform", {
        value: "linux",
      });

      // Act
      const result = await service.install({
        composeVersion: expectedVersion,
        cwd: "/path/to/cwd",
        githubToken: null,
      });

      // Assert
      expect(result).toBe(expectedVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(expectedVersion);
    });

    it("should install the latest version if requested", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      const latestVersion = "v1.4.0";

      const mockClient = mockAgent.get("https://api.github.com");
      mockClient
        .intercept({
          path: "/repos/docker/compose/releases/latest",
          method: "GET",
        })
        .reply(
          200,
          {
            tag_name: latestVersion,
          },
          {
            headers: {
              "content-type": "application/json",
            },
          }
        );
      setGlobalDispatcher(mockClient);

      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: latestVersion,
        },
      });

      Object.defineProperty(process, "platform", {
        value: "linux",
      });
      Object.defineProperty(globalThis, "fetch", {
        value: jest.fn(),
      });

      // Act
      const result = await service.install({
        composeVersion: "latest",
        cwd: "/path/to/cwd",
        githubToken: "token",
      });

      // Assert
      expect(result).toBe(latestVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(latestVersion);
    });

    it("should throw an error if the latest version if requested and no Github token is provided", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      // Act & Assert
      await expect(
        service.install({
          composeVersion: "latest",
          cwd: "/path/to/cwd",
          githubToken: null,
        })
      ).rejects.toThrow("GitHub token is required to install the latest version");
    });

    it("should throw an error on unsupported platforms", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      const expectedVersion = "1.3.0";
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: expectedVersion,
        },
      });

      Object.defineProperty(process, "platform", {
        value: "win32",
      });

      // Act & Assert
      await expect(
        service.install({
          composeVersion: expectedVersion,
          cwd: "/path/to/cwd",
          githubToken: null,
        })
      ).rejects.toThrow(`Unsupported platform: win32`);

      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should install when version check fails", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version not installed"));

      const installedVersion = "2.0.0";

      // After installation, version() returns the new version
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: installedVersion,
        },
      });

      Object.defineProperty(process, "platform", {
        value: "linux",
      });

      // Act
      const result = await service.install({
        composeVersion: installedVersion,
        cwd: "/path/to/cwd",
        githubToken: "token",
      });

      // Assert
      expect(result).toBe(installedVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(installedVersion);
    });

    it("should install latest version when missing or unspecified", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version check failed"));
      // second call finds newly installed version
      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "v1.4.0",
        },
      });

      const latestVersion = "v1.4.0";

      const mockClient = mockAgent.get("https://api.github.com");
      mockClient
        .intercept({
          path: "/repos/docker/compose/releases/latest",
          method: "GET",
        })
        .reply(
          200,
          {
            tag_name: latestVersion,
          },
          {
            headers: {
              "content-type": "application/json",
            },
          }
        );
      setGlobalDispatcher(mockClient);

      versionMock.mockResolvedValueOnce({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: latestVersion,
        },
      });

      Object.defineProperty(process, "platform", {
        value: "linux",
      });
      Object.defineProperty(globalThis, "fetch", {
        value: jest.fn(),
      });

      // Act
      const result = await service.install({
        composeVersion: "latest",
        cwd: "/path/to/cwd",
        githubToken: "token",
      });

      // Assert
      expect(result).toBe(latestVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(latestVersion);
    });

    it("should throw if Compose is missing and no GitHub token is provided", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version check failed"));

      Object.defineProperty(process, "platform", {
        value: "linux",
      });

      await expect(
        service.install({
          composeVersion: "latest",
          cwd: "/path/to/cwd",
          githubToken: null,
        })
      ).rejects.toThrow("GitHub token is required to install the latest version");
    });

    it("should not install when the version is already installed and no version is specified", async () => {
      // Arrange
      versionMock.mockResolvedValue({
        exitCode: 0,
        out: "",
        err: "",
        data: {
          version: "1.2.3",
        },
      });

      // Act
      const result = await service.install({
        composeVersion: "",
        cwd: "/path/to/cwd",
        githubToken: null,
      });

      // Assert
      expect(result).toBe("1.2.3");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });
  });
});
