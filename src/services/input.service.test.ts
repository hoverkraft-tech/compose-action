import { InputService, InputNames } from "./input.service";
import { LoggerService } from "./logger.service";
import * as core from "@actions/core";
import * as fs from "fs";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  promises: {
    access: jest.fn(),
  },
}));
jest.mock("@actions/core");

describe("InputService", () => {
  let service: InputService;
  let logger: LoggerService;
  let getInputMock: jest.SpiedFunction<typeof core.getInput>;
  let getMultilineInputMock: jest.SpiedFunction<typeof core.getMultilineInput>;
  let existsSyncMock: jest.SpiedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    logger = new LoggerService();
    service = new InputService(logger);

    existsSyncMock = jest.spyOn(fs, "existsSync").mockImplementation();
    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    getMultilineInputMock = jest.spyOn(core, "getMultilineInput").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getInputs", () => {
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

      it("should return only existing composeFiles input", () => {
        getMultilineInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeFile:
              return ["file1", "file2"];
            default:
              return [];
          }
        });

        getInputMock.mockReturnValue("");

        existsSyncMock.mockImplementation((file) => file === "file1");

        const inputs = service.getInputs();

        expect(inputs.composeFiles).toEqual(["file1"]);
      });
    });

    describe("services", () => {
      it("should return given services input", () => {
        getMultilineInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.Services:
              return ["service1", "service2"];
            default:
              return [];
          }
        });

        getInputMock.mockReturnValue("");

        const inputs = service.getInputs();

        expect(inputs.services).toEqual(["service1", "service2"]);
      });
    });

    describe("compose-flags", () => {
      it("should return given compose-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.ComposeFlags:
              return "compose-flag1 compose-flag2";
            default:
              return "";
          }
        });

        const inputs = service.getInputs();

        expect(inputs.composeFlags).toEqual(["compose-flag1", "compose-flag2"]);
      });

      it("should return empty array when no compose-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockReturnValue("");
        const inputs = service.getInputs();

        expect(inputs.composeFlags).toEqual([]);
      });
    });

    describe("up-flags", () => {
      it("should return given up-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.UpFlags:
              return "up-flag1 up-flag2";
            default:
              return "";
          }
        });

        const inputs = service.getInputs();

        expect(inputs.upFlags).toEqual(["up-flag1", "up-flag2"]);
      });

      it("should return empty array when no up-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockReturnValue("");
        const inputs = service.getInputs();

        expect(inputs.upFlags).toEqual([]);
      });
    });

    describe("down-flags", () => {
      it("should return given down-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.DownFlags:
              return "down-flag1 down-flag2";
            default:
              return "";
          }
        });

        const inputs = service.getInputs();

        expect(inputs.downFlags).toEqual(["down-flag1", "down-flag2"]);
      });

      it("should return empty array when no down-flags input", () => {
        getMultilineInputMock.mockReturnValue([]);

        getInputMock.mockReturnValue("");
        const inputs = service.getInputs();

        expect(inputs.downFlags).toEqual([]);
      });
    });

    describe("cwd", () => {
      it("should return given cwd input", () => {
        getMultilineInputMock.mockReturnValue([]);
        getInputMock.mockImplementation((inputName) => {
          switch (inputName) {
            case InputNames.Cwd:
              return "cwd";
            default:
              return "";
          }
        });

        const inputs = service.getInputs();

        expect(inputs.cwd).toEqual("cwd");
      });
    });
  });
});
