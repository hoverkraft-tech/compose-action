import { getInput, getMultilineInput } from "@actions/core";
import { LoggerService } from "./logger.service";
import { existsSync } from "fs";

export type Inputs = {
  composeFiles: string[];
  services: string[];
  composeFlags: string[];
  upFlags: string[];
  downFlags: string[];
};

export enum InputNames {
  ComposeFile = "compose-file",
  Services = "services",
  ComposeFlags = "compose-flags",
  UpFlags = "up-flags",
  DownFlags = "down-flags",
}

export class InputService {
  constructor(private readonly logger: LoggerService) {}

  getInputs(): Inputs {
    return {
      composeFiles: this.getComposeFiles(),
      services: this.getServices(),
      composeFlags: this.getComposeFlags(),
      upFlags: this.getUpFlags(),
      downFlags: this.getDownFlags(),
    };
  }

  private getComposeFiles(): string[] {
    return getMultilineInput(InputNames.ComposeFile).filter((composeFile) => {
      if (!composeFile.length) {
        return false;
      }

      if (!existsSync(composeFile)) {
        this.logger.warn(`${composeFile} not exists`);
        return false;
      }

      return true;
    });
  }

  private getServices(): string[] {
    return getMultilineInput(InputNames.Services, { required: false });
  }

  private getComposeFlags(): string[] {
    return this.parseFlags(getInput(InputNames.ComposeFlags));
  }

  private getUpFlags(): string[] {
    return this.parseFlags(getInput(InputNames.UpFlags));
  }

  private getDownFlags(): string[] {
    return this.parseFlags(getInput(InputNames.DownFlags));
  }

  private parseFlags(flags: string | null): string[] {
    if (!flags) {
      return [];
    }

    return flags.trim().split(" ");
  }
}
