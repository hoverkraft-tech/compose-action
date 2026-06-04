import { describe, expect, it, beforeEach, vi } from "vitest";

// Mock @actions/core
const setFailedMock = vi.fn();

vi.doMock("@actions/core", () => ({
	setFailed: setFailedMock,
	getInput: vi.fn().mockReturnValue(""),
	getMultilineInput: vi.fn().mockReturnValue([]),
	debug: vi.fn(),
	info: vi.fn(),
	warning: vi.fn(),
}));

// Mock docker-compose
vi.doMock("docker-compose", () => ({
	upAll: vi.fn(),
	upMany: vi.fn(),
	down: vi.fn(),
	logs: vi.fn(),
	version: vi
		.fn<() => Promise<{ data: { version: string } }>>()
		.mockResolvedValue({ data: { version: "1.2.3" } }),
}));

// Mock node:fs
vi.doMock("node:fs", async () => {
	const actualFs = await vi.importActual<typeof import("node:fs")>("node:fs");

	return {
		...actualFs,
		existsSync: vi.fn().mockReturnValue(true),
		default: {
			...actualFs,
			existsSync: vi.fn().mockReturnValue(true),
		},
	};
});

// Dynamic imports after mock setup
const { run } = await import("./index-runner.js");
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import(
	"./services/logger.service.js"
);
const { DockerComposeInstallerService } = await import(
	"./services/docker-compose-installer.service.js"
);
const { DockerComposeService } = await import(
	"./services/docker-compose.service.js"
);

describe("run", () => {
	let infoMock: ReturnType<typeof vi.spyOn>;
	let debugMock: ReturnType<typeof vi.spyOn>;
	let getInputsMock: ReturnType<typeof vi.spyOn>;
	let installMock: ReturnType<typeof vi.spyOn>;
	let upMock: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();

		infoMock = vi
			.spyOn(LoggerService.prototype, "info")
			.mockImplementation(() => {});
		debugMock = vi
			.spyOn(LoggerService.prototype, "debug")
			.mockImplementation(() => {});
		getInputsMock = vi.spyOn(InputService.prototype, "getInputs");
		installMock = vi.spyOn(DockerComposeInstallerService.prototype, "install");
		upMock = vi.spyOn(DockerComposeService.prototype, "up");
	});

	it("should install docker compose with specified version", async () => {
		// Arrange
		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: [],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: "1.29.2",
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		installMock.mockResolvedValue("1.29.2");

		upMock.mockResolvedValue();

		// Act
		await run();

		// Assert
		expect(infoMock).toHaveBeenCalledWith(
			"Setting up docker compose version 1.29.2",
		);

		expect(debugMock).toHaveBeenCalledWith(
			'inputs: {"dockerFlags":[],"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":"1.29.2","githubToken":null,"serviceLogLevel":"debug"}',
		);

		expect(installMock).toHaveBeenCalledWith({
			composeVersion: "1.29.2",
			cwd: "/current/working/dir",
			githubToken: null,
		});

		expect(upMock).toHaveBeenCalledWith({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			composeFlags: [],
			cwd: "/current/working/dir",
			upFlags: [],
			services: [],
			serviceLogger: debugMock,
		});

		expect(setFailedMock).not.toHaveBeenCalled();
	});

	it("should bring up docker compose services", async () => {
		// Arrange
		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: ["web"],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: null,
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		// Act
		await run();

		// Assert
		expect(upMock).toHaveBeenCalledWith({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			composeFlags: [],
			cwd: "/current/working/dir",
			upFlags: [],
			services: ["web"],
			serviceLogger: debugMock,
		});
		expect(setFailedMock).not.toHaveBeenCalled();
	});

	it("should handle errors and call setFailed", async () => {
		// Arrange
		const error = new Error("Test error");
		upMock.mockRejectedValue(error);

		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: ["web"],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: null,
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		// Act
		await run();

		// Assert
		expect(setFailedMock).toHaveBeenCalledWith("Error: Test error");
	});

	it("should handle unknown errors and call setFailed", async () => {
		// Arrange
		const error = "Test error";
		upMock.mockRejectedValue(error);

		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: ["web"],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: null,
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		// Act
		await run();

		// Assert
		expect(setFailedMock).toHaveBeenCalledWith('"Test error"');
	});
});
