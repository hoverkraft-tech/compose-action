import { ManualInstallerAdapter } from "./manual-installer-adapter";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as toolCache from "@actions/tool-cache";

jest.mock("@actions/exec");
jest.mock("@actions/io");
jest.mock("@actions/tool-cache");

describe("ManualInstallerAdapter", () => {
  let mkdirPMock: jest.SpiedFunction<typeof io.mkdirP>;
  let execMock: jest.SpiedFunction<typeof exec.exec>;
  let cacheFileMock: jest.SpiedFunction<typeof toolCache.cacheFile>;
  let downloadToolMock: jest.SpiedFunction<typeof toolCache.downloadTool>;

  let adapter: ManualInstallerAdapter;

  beforeEach(() => {
    mkdirPMock = jest.spyOn(io, "mkdirP").mockImplementation();
    execMock = jest.spyOn(exec, "exec").mockImplementation();
    cacheFileMock = jest.spyOn(toolCache, "cacheFile").mockImplementation();
    downloadToolMock = jest.spyOn(toolCache, "downloadTool").mockImplementation();

    adapter = new ManualInstallerAdapter();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
