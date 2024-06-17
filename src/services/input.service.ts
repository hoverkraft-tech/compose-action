import { getInput, getMultilineInput } from "@actions/core";
import { existsSync } from "fs";
import { join } from "path";

export type Inputs = {
  composeFiles: string[];
  services: string[];
  composeFlags: string[];
  upFlags: string[];
  downFlags: string[];
  cwd: string;
};

export enum InputNames {
  ComposeFile = "compose-file",
  Services = "services",
  ComposeFlags = "compose-flags",
  UpFlags = "up-flags",
  DownFlags = "down-flags",
  Cwd = "cwd",
}

export class InputService {
  getInputs(): Inputs {
    return {
      composeFiles: this.getComposeFiles(),
      services: this.getServices(),
      composeFlags: this.getComposeFlags(),
      upFlags: this.getUpFlags(),
      downFlags: this.getDownFlags(),
      cwd: this.getCwd(),
    };
  }

  private getComposeFiles(): string[] {
    const cwd = this.getCwd();
    const composeFiles = getMultilineInput(InputNames.ComposeFile).filter((composeFile: string) => {
      if (!composeFile.length) {
        return false;
      }

      if (!existsSync(join(cwd, composeFile))) {
        throw new Error(`${composeFile} does not exist in ${cwd}`);
      }

      return true;
    });

    if (!composeFiles.length) {
      throw new Error("No compose files found");
    }

    return composeFiles;
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

  private getCwd(): string {
    return getInput(InputNames.Cwd);
  }
}
