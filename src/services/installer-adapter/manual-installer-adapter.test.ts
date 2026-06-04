import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ExecOptions } from "@actions/exec";
import type { OutgoingHttpHeaders } from "node:http";

// Mock @actions/exec
const execMock =
	vi.fn<
		(command: string, args?: string[], options?: ExecOptions) => Promise<number>
	>();

vi.doMock("@actions/exec", () => ({
	exec: execMock,
}));

// Mock @actions/io
const mkdirPMock = vi.fn<(fsPath: string) => Promise<void>>();

vi.doMock("@actions/io", () => ({
	mkdirP: mkdirPMock,
}));

// Mock @actions/tool-cache
const cacheFileMock =
	vi.fn<
		(
			sourceFile: string,
			targetFile: string,
			tool: string,
			version: string,
			arch?: string,
		) => Promise<string>
	>();
const downloadToolMock =
	vi.fn<
		(
			url: string,
			dest?: string,
			auth?: string,
			headers?: OutgoingHttpHeaders,
		) => Promise<string>
	>();

vi.doMock("@actions/tool-cache", () => ({
	cacheFile: cacheFileMock,
	downloadTool: downloadToolMock,
}));

// Dynamic import after mock setup
const { ManualInstallerAdapter } = await import(
	"./manual-installer-adapter.js"
);

const originalHome = process.env.HOME;
const originalDockerConfig = process.env.DOCKER_CONFIG;

describe("ManualInstallerAdapter", () => {
	let adapter: InstanceType<typeof ManualInstallerAdapter>;

	beforeEach(() => {
		vi.resetAllMocks();
		if (originalHome === undefined) {
			delete process.env.HOME;
		} else {
			process.env.HOME = originalHome;
		}
		if (originalDockerConfig === undefined) {
			delete process.env.DOCKER_CONFIG;
		} else {
			process.env.DOCKER_CONFIG = originalDockerConfig;
		}
		adapter = new ManualInstallerAdapter();
	});

	describe("install", () => {
		it("should install docker compose correctly", async () => {
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

			process.env.HOME = "/home/test";

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
				"https://github.com/docker/compose/releases/download/v2.29.0/docker-compose-Linux-x86_64",
				"/home/test/.docker/cli-plugins/docker-compose",
			);

			expect(cacheFileMock).toHaveBeenCalledWith(
				"/home/test/.docker/cli-plugins/docker-compose",
				"docker-compose",
				"docker-compose",
				version,
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
				"/custom/docker/cli-plugins/docker-compose",
			);
		});

		it("should handle version without 'v' prefix", async () => {
			// Arrange
			const version = "2.29.0";

			execMock.mockImplementationOnce(async (_command, _args, options) => {
				options?.listeners?.stdout?.(Buffer.from("Linux\n"));
				return 0;
			});

			execMock.mockImplementationOnce(async (_command, _args, options) => {
				options?.listeners?.stdout?.(Buffer.from("x86_64\n"));
				return 0;
			});

			process.env.HOME = "/home/test";

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
				"https://github.com/docker/compose/releases/download/v2.29.0/docker-compose-Linux-x86_64",
				"/home/test/.docker/cli-plugins/docker-compose",
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
			process.env.HOME = "/home/test";

			// Act
			await adapter.install(version);

			// Assert
			expect(downloadToolMock).toHaveBeenCalledWith(
				"https://github.com/docker/compose/releases/download/1.29.0/docker-compose-Linux-x86_64",
				"/home/test/.docker/cli-plugins/docker-compose",
			);
		});

		it("should throw an error if a command fails", async () => {
			// Arrange
			const version = "v2.29.0";

			// Uname -s
			execMock.mockResolvedValueOnce(1);

			// Act
			await expect(adapter.install(version)).rejects.toThrow(
				"Failed to run command: uname -s",
			);

			// Assert
			expect(execMock).toHaveBeenNthCalledWith(1, "uname -s", [], {
				listeners: { stdout: expect.any(Function) },
			});
		});
	});
});
