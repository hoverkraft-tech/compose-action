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

let getInputsMock: ReturnType<typeof vi.spyOn>;
let debugMock: ReturnType<typeof vi.spyOn>;
let infoMock: ReturnType<typeof vi.spyOn>;
let installMock: ReturnType<typeof vi.spyOn>;
let upMock: ReturnType<typeof vi.spyOn>;

describe("index", () => {
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

		installMock.mockResolvedValue("1.2.3");
		upMock.mockResolvedValueOnce();

		await import("./index.js");
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(infoMock).toHaveBeenNthCalledWith(1, "Setting up docker compose");
		expect(infoMock).toHaveBeenNthCalledWith(
			2,
			"docker compose version: 1.2.3",
		);

		// Verify that all of the functions were called correctly
		expect(debugMock).toHaveBeenNthCalledWith(
			1,
			'inputs: {"dockerFlags":[],"composeFiles":["docker-compose.yml"],"services":[],"composeFlags":[],"upFlags":[],"downFlags":[],"cwd":"/current/working/dir","composeVersion":null,"githubToken":null,"serviceLogLevel":"debug"}',
		);

		expect(infoMock).toHaveBeenNthCalledWith(
			3,
			"Bringing up docker compose service(s)",
		);

		expect(upMock).toHaveBeenCalledWith({
			dockerFlags: [],
			composeFiles: ["docker-compose.yml"],
			services: [],
			composeFlags: [],
			upFlags: [],
			cwd: "/current/working/dir",
			serviceLogger: debugMock,
		});

		expect(setFailedMock).not.toHaveBeenCalled();

		expect(infoMock).toHaveBeenNthCalledWith(
			4,
			"docker compose service(s) are up",
		);
	});
});
