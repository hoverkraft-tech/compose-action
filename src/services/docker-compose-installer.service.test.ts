import * as dockerCompose from "docker-compose";
import { DockerComposeInstallerService } from "./docker-compose-installer.service";
import { ManualInstallerAdapter } from "./installer-adapter/manual-installer-adapter";
import { MockAgent, setGlobalDispatcher } from "undici";

jest.mock("docker-compose");

describe("DockerComposeInstallerService", () => {
  let mockAgent: MockAgent;
  let versionMock: jest.SpiedFunction<typeof dockerCompose.version>;
  let manualInstallerAdapterMock: jest.Mocked<ManualInstallerAdapter>;
  let service: DockerComposeInstallerService;

  beforeEach(() => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();

    versionMock = jest.spyOn(dockerCompose, "version").mockImplementation();

    manualInstallerAdapterMock = {
      install: jest.fn(),
    } as unknown as jest.Mocked<ManualInstallerAdapter>;

    service = new DockerComposeInstallerService(manualInstallerAdapterMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("install", () => {
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
  });
});
