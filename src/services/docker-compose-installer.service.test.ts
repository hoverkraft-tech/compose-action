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

  const composeVersionResponse = (version: string) => ({
    exitCode: 0,
    out: "",
    err: "",
    data: {
      version,
    },
  });

  const installCompose = (composeVersion: string | null, githubToken: string | null) =>
    service.install({
      composeVersion,
      cwd: "/path/to/cwd",
      githubToken,
    });

  const setPlatform = (platform: NodeJS.Platform) => {
    Object.defineProperty(process, "platform", {
      value: platform,
    });
  };

  const mockLatestRelease = (version: string) => {
    const mockClient = mockAgent.get("https://api.github.com");
    mockClient
      .intercept({
        path: "/repos/docker/compose/releases/latest",
        method: "GET",
      })
      .reply(
        200,
        {
          tag_name: version,
        },
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
    setGlobalDispatcher(mockClient);
    Object.defineProperty(globalThis, "fetch", {
      value: jest.fn(),
    });
  };

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
      versionMock.mockResolvedValue(composeVersionResponse("2.0.0"));

      // Act
      const result = await installCompose(null, null);

      // Assert
      expect(result).toBe("2.0.0");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should not install anything when expected version is already installed", async () => {
      // Arrange
      versionMock.mockResolvedValue(composeVersionResponse("1.2.3"));

      // Act
      const result = await installCompose("v1.2.3", null);

      // Assert
      expect(result).toBe("1.2.3");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should install the requested version if it is not already installed", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.2.3"));

      const expectedVersion = "1.3.0";
      versionMock.mockResolvedValueOnce(composeVersionResponse(expectedVersion));
      setPlatform("linux");

      // Act
      const result = await installCompose(expectedVersion, null);

      // Assert
      expect(result).toBe(expectedVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(expectedVersion);
    });

    it("should install the latest version if requested", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.2.3"));

      const latestVersion = "v1.4.0";
      mockLatestRelease(latestVersion);
      versionMock.mockResolvedValueOnce(composeVersionResponse(latestVersion));
      setPlatform("linux");

      // Act
      const result = await installCompose("latest", "token");

      // Assert
      expect(result).toBe(latestVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(latestVersion);
    });

    it("should throw an error if the latest version if requested and no Github token is provided", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.2.3"));

      // Act & Assert
      await expect(installCompose("latest", null)).rejects.toThrow(
        "GitHub token is required to install the latest version"
      );
    });

    it("should throw an error on unsupported platforms", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.2.3"));

      const expectedVersion = "1.3.0";
      versionMock.mockResolvedValueOnce(composeVersionResponse(expectedVersion));
      setPlatform("win32");

      // Act & Assert
      await expect(installCompose(expectedVersion, null)).rejects.toThrow(
        `Unsupported platform: win32`
      );

      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should install when version check fails", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version not installed"));

      const installedVersion = "2.0.0";

      // After installation, version() returns the new version
      versionMock.mockResolvedValueOnce(composeVersionResponse(installedVersion));
      setPlatform("linux");

      // Act
      const result = await installCompose(installedVersion, "token");

      // Assert
      expect(result).toBe(installedVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(installedVersion);
    });

    it("should install latest version when missing or unspecified", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version check failed"));
      // second call finds newly installed version
      versionMock.mockResolvedValueOnce(composeVersionResponse("v1.4.0"));

      const latestVersion = "v1.4.0";
      mockLatestRelease(latestVersion);
      versionMock.mockResolvedValueOnce(composeVersionResponse(latestVersion));
      setPlatform("linux");

      // Act
      const result = await installCompose("latest", "token");

      // Assert
      expect(result).toBe(latestVersion);
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(latestVersion);
    });

    it("should throw if Compose is missing and no GitHub token is provided", async () => {
      // Arrange: first call to version() doesn't find
      versionMock.mockRejectedValueOnce(new Error("version check failed"));
      setPlatform("linux");

      await expect(installCompose("latest", null)).rejects.toThrow(
        "GitHub token is required to install the latest version"
      );
    });

    it("should not install when the version is already installed and no version is specified", async () => {
      // Arrange
      versionMock.mockResolvedValue(composeVersionResponse("1.2.3"));

      // Act
      const result = await installCompose("", null);

      // Assert
      expect(result).toBe("1.2.3");
      expect(manualInstallerAdapterMock.install).not.toHaveBeenCalled();
    });

    it("should throw when installed version does not match target", async () => {
      // Arrange
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.2.3"));

      const targetVersion = "v1.4.0";
      versionMock.mockResolvedValueOnce(composeVersionResponse("1.3.0"));
      setPlatform("linux");

      // Act & Assert
      await expect(installCompose(targetVersion, "token")).rejects.toThrow(
        `Failed to install Docker Compose version "${targetVersion}", installed version is "1.3.0"`
      );
      expect(manualInstallerAdapterMock.install).toHaveBeenCalledWith(targetVersion);
    });
  });
});
