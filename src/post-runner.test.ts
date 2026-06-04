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
const logsMock = vi.fn();
const downMock = vi.fn();

vi.doMock("docker-compose", () => ({
	logs: logsMock,
	down: downMock,
	upAll: vi.fn(),
	upMany: vi.fn(),
}));

// Mock node:fs
vi.doMock("node:fs", () => ({
	existsSync: vi.fn().mockReturnValue(true),
	default: { existsSync: vi.fn().mockReturnValue(true) },
}));

// Dynamic imports after mock setup
const { run } = await import("./post-runner.js");
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import(
	"./services/logger.service.js"
);
const { DockerComposeService } = await import(
	"./services/docker-compose.service.js"
);

describe("run", () => {
	let infoMock: ReturnType<typeof vi.spyOn>;
	let debugMock: ReturnType<typeof vi.spyOn>;
	let getInputsMock: ReturnType<typeof vi.spyOn>;
	let serviceDownMock: ReturnType<typeof vi.spyOn>;
	let serviceLogsMock: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();

		infoMock = vi
			.spyOn(LoggerService.prototype, "info")
			.mockImplementation(() => {});
		debugMock = vi
			.spyOn(LoggerService.prototype, "debug")
			.mockImplementation(() => {});
		getInputsMock = vi.spyOn(InputService.prototype, "getInputs");
		serviceDownMock = vi.spyOn(DockerComposeService.prototype, "down");
		serviceLogsMock = vi.spyOn(DockerComposeService.prototype, "logs");
	});

	it("should bring down docker compose service(s) and log output", async () => {
		// Arrange
		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: [],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: null,
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		serviceLogsMock.mockResolvedValue({ error: "", output: "test logs" });
		serviceDownMock.mockResolvedValue();

		// Act
		await run();

		// Assert
		expect(serviceLogsMock).toHaveBeenCalledWith({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			composeFlags: [],
			cwd: "/current/working/dir",
			services: [],
			serviceLogger: debugMock,
		});

		expect(serviceDownMock).toHaveBeenCalledWith({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			composeFlags: [],
			cwd: "/current/working/dir",
			downFlags: [],
			serviceLogger: debugMock,
		});

		expect(debugMock).toHaveBeenCalledWith("docker compose logs:\ntest logs");
		expect(infoMock).toHaveBeenCalledWith("docker compose is down");
		expect(setFailedMock).not.toHaveBeenCalled();
	});

	it("should log docker composer errors if any", async () => {
		// Arrange
		getInputsMock.mockImplementation(() => ({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: [],
			composeFlags: [],
			upFlags: [],
			downFlags: [],
			cwd: "/current/working/dir",
			composeVersion: null,
			githubToken: null,
			serviceLogLevel: LogLevel.Debug,
		}));

		serviceLogsMock.mockResolvedValue({
			error: "test logs error",
			output: "test logs output",
		});

		serviceDownMock.mockResolvedValue();

		// Act
		await run();

		// Assert
		expect(debugMock).toHaveBeenCalledWith(
			"docker compose error:\ntest logs error",
		);
		expect(debugMock).toHaveBeenCalledWith(
			"docker compose logs:\ntest logs output",
		);
		expect(infoMock).toHaveBeenCalledWith("docker compose is down");
	});

	it("should set failed when an error occurs", async () => {
		// Arrange
		getInputsMock.mockImplementation(() => {
			throw new Error("An error occurred");
		});

		// Act
		await run();

		// Assert
		expect(setFailedMock).toHaveBeenCalledWith("Error: An error occurred");
	});

	it("should handle errors and call setFailed", async () => {
		// Arrange
		const error = new Error("Test error");
		serviceDownMock.mockRejectedValue(error);

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
		serviceDownMock.mockRejectedValue(error);

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
