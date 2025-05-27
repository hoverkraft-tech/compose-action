import * as core from "@actions/core";
import fs from "fs";
import { InputService, InputNames } from "./input.service";
import { LogLevel } from "./logger.service";

describe("InputService", () => {
  let service: InputService;
  let getInputMock: jest.SpiedFunction<typeof core.getInput>;
  let getMultilineInputMock: jest.SpiedFunction<typeof core.getMultilineInput>;
  let existsSyncMock: jest.SpiedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    jest.clearAllMocks();

    existsSyncMock = jest.spyOn(fs, "existsSync").mockImplementation();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    getMultilineInputMock = jest.spyOn(core, "getMultilineInput").mockImplementation();

    getMultilineInputMock.mockImplementation((inputName) => {
      switch (inputName) {
        case InputNames.ComposeFile:
          return ["file1"];
        default:
          return [];
      }
    });

    service = new InputService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getInputs", () => {
    describe("docker-flags", () => {
      it("should return given docker-flags input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.DockerFlags:
              return "docker-flag1 docker-flag2";
            default:
              return "";
          }
        });

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.dockerFlags).toEqual(["docker-flag1", "docker-flag2"]);
      });

      it("should return empty array when no docker-flags input", () => {
        getInputMock.mockReturnValue("");

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.dockerFlags).toEqual([]);
      });
    });

    describe("composeFiles", () => {
      it("should return given composeFiles input", () => {
        getMultilineInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeFile:
              return ["file1", "file2"];
            default:
              return [];
          }
        });

        getInputMock.mockReturnValue("");

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.composeFiles).toEqual(["file1", "file2"]);
      });

      it("should throws an error when a compose file does not exist", () => {
        getMultilineInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeFile:
              return ["file1", "file2"];
            default:
              return [];
          }
        });

        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.Cwd:
              return "/current/working/directory";
            default:
              return "";
          }
        });

        existsSyncMock.mockImplementation((file) => file === "/current/working/directory/file1");

        expect(() => service.getInputs()).toThrow(
          'Compose file not found in "/current/working/directory/file2", "file2"'
        );
      });

      it("should throws an error when no composeFiles input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockReturnValue("");

        expect(() => service.getInputs()).toThrow("No compose files found");
      });
    });

    describe("services", () => {
      it("should return given services input", () => {
        getMultilineInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.Services:
              return ["service1", "service2"];
            case InputNames.ComposeFile:
              return ["file1"];
            default:
              return [];
          }
        });

        getInputMock.mockReturnValue("");
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.services).toEqual(["service1", "service2"]);
      });
    });

    describe("compose-flags", () => {
      it("should return given compose-flags input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeFlags:
              return "compose-flag1 compose-flag2";
            default:
              return "";
          }
        });

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.composeFlags).toEqual(["compose-flag1", "compose-flag2"]);
      });

      it("should return empty array when no compose-flags input", () => {
        getInputMock.mockReturnValue("");

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.composeFlags).toEqual([]);
      });
    });

    describe("up-flags", () => {
      it("should return given up-flags input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.UpFlags:
              return "up-flag1 up-flag2";
            default:
              return "";
          }
        });

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.upFlags).toEqual(["up-flag1", "up-flag2"]);
      });

      it("should return empty array when no up-flags input", () => {
        getInputMock.mockReturnValue("");

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.upFlags).toEqual([]);
      });
    });

    describe("down-flags", () => {
      it("should return given down-flags input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.DownFlags:
              return "down-flag1 down-flag2";
            default:
              return "";
          }
        });

        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.downFlags).toEqual(["down-flag1", "down-flag2"]);
      });

      it("should return empty array when no down-flags input", () => {
        getInputMock.mockReturnValue("");
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.downFlags).toEqual([]);
      });
    });

    describe("cwd", () => {
      it("should return given cwd input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.Cwd:
              return "cwd";
            default:
              return "";
          }
        });
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.cwd).toEqual("cwd");
      });
    });

    describe("compose-version", () => {
      it("should return given compose-version input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeVersion:
              return "compose-version";
            default:
              return "";
          }
        });
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();

        expect(inputs.composeVersion).toEqual("compose-version");
      });
    });

    describe("services-log-level", () => {
      it("should return given services-log-level input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ServiceLogLevel:
              return "info";
            default:
              return "";
          }
        });
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();
        expect(inputs.serviceLogLevel).toEqual(LogLevel.Info);
      });

      it("should return default services-log-level input", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ServiceLogLevel:
              return "";
            default:
              return "";
          }
        });
        existsSyncMock.mockReturnValue(true);

        const inputs = service.getInputs();
        expect(inputs.serviceLogLevel).toEqual(LogLevel.Debug);
      });

      it("should throw an error when services-log-level input is invalid", () => {
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ServiceLogLevel:
              return "invalid-log-level";
            default:
              return "";
          }
        });
        existsSyncMock.mockReturnValue(true);

        expect(() => service.getInputs()).toThrow(
          'Invalid service log level "invalid-log-level". Valid values are: debug, info'
        );
      });
    });
  });
});
