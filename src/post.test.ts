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
const { InputService } = await import("./services/input.service.js");
const { LoggerService, LogLevel } = await import(
	"./services/logger.service.js"
);
const { DockerComposeService } = await import(
	"./services/docker-compose.service.js"
);

let getInputsMock: ReturnType<typeof vi.spyOn>;
let debugMock: ReturnType<typeof vi.spyOn>;
let infoMock: ReturnType<typeof vi.spyOn>;
let serviceLogsMock: ReturnType<typeof vi.spyOn>;
let serviceDownMock: ReturnType<typeof vi.spyOn>;

describe("post", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		infoMock = vi
			.spyOn(LoggerService.prototype, "info")
			.mockImplementation(() => {});
		debugMock = vi
			.spyOn(LoggerService.prototype, "debug")
			.mockImplementation(() => {});
		getInputsMock = vi.spyOn(InputService.prototype, "getInputs");
		serviceLogsMock = vi.spyOn(DockerComposeService.prototype, "logs");
		serviceDownMock = vi.spyOn(DockerComposeService.prototype, "down");
	});

	it("calls run when imported", async () => {
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
		serviceDownMock.mockResolvedValueOnce();

		await import("./post.js");
		await new Promise((resolve) => setTimeout(resolve, 0));

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

		expect(debugMock).toHaveBeenNthCalledWith(
			1,
			"docker compose logs:\ntest logs",
		);
		expect(infoMock).toHaveBeenNthCalledWith(1, "docker compose is down");

		expect(setFailedMock).not.toHaveBeenCalled();
	});
});
