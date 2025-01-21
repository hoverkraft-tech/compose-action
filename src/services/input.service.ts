import { getInput, getMultilineInput } from "@actions/core";
import { existsSync } from "fs";
import { join } from "path";

export type Inputs = {
  dockerFlags: string[];
  composeFiles: string[];
  services: string[];
  composeFlags: string[];
  upFlags: string[];
  downFlags: string[];
  cwd: string;
  composeVersion: string | null;
  githubToken: string | null;
};

export enum InputNames {
  DockerFlags = "docker-flags",
  ComposeFile = "compose-file",
  Services = "services",
  ComposeFlags = "compose-flags",
  UpFlags = "up-flags",
  DownFlags = "down-flags",
  Cwd = "cwd",
  ComposeVersion = "compose-version",
  GithubToken = "github-token",
}

export const COMPOSE_VERSION_LATEST = "latest";

export class InputService {
  getInputs(): Inputs {
    return {
      dockerFlags: this.getDockerFlags(),
      composeFiles: this.getComposeFiles(),
      services: this.getServices(),
      composeFlags: this.getComposeFlags(),
      upFlags: this.getUpFlags(),
      downFlags: this.getDownFlags(),
      cwd: this.getCwd(),
      composeVersion: this.getComposeVersion(),
      githubToken: this.getGithubToken(),
    };
  }

  private getDockerFlags(): string[] {
    return this.parseFlags(getInput(InputNames.DockerFlags));
  }

  private getComposeFiles(): string[] {
    const cwd = this.getCwd();
    const composeFiles = getMultilineInput(InputNames.ComposeFile).filter((composeFile: string) => {
      if (!composeFile.trim().length) {
        return false;
      }

      const possiblePaths = [join(cwd, composeFile), composeFile];

      for (const path of possiblePaths) {
        if (existsSync(path)) {
          return true;
        }
      }

      throw new Error(`Compose file not found in "${possiblePaths.join('", "')}"`);
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

  private getComposeVersion(): string | null {
    return (
      getInput(InputNames.ComposeVersion, {
        required: false,
      }) || null
    );
  }

  private getGithubToken(): string | null {
    return (
      getInput(InputNames.GithubToken, {
        required: false,
      }) || null
    );
  }
}
