import * as dockerCompose from "docker-compose";
import { DockerComposeInstallerService } from "./docker-compose-installer.service";

jest.mock("docker-compose");

describe("DockerComposeInstallerService", () => {
  let service: DockerComposeInstallerService;
  let versionMock: jest.SpiedFunction<typeof dockerCompose.version>;

  beforeEach(() => {
    service = new DockerComposeInstallerService();
    versionMock = jest.spyOn(dockerCompose, "version").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("install", () => {
    it("should install the requested version if it is not already installed", async () => {
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
      });

      // Assert
      expect(result).toBe("1.2.3");
    });

    it("should throw an error if the requested version does not match the current version", async () => {
      // Arrange
      versionMock.mockResolvedValue({
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
          composeVersion: "4.5.6",
          cwd: "/path/to/cwd",
        })
      ).rejects.toThrow("Requested version 4.5.6 does not match current version 1.2.3");
    });
  });
});
