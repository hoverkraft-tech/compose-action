import * as github from "@actions/github";
import { version } from "docker-compose";
import { COMPOSE_VERSION_LATEST, Inputs } from "./input.service.js";
import { ManualInstallerAdapter } from "./installer-adapter/manual-installer-adapter.js";

export type InstallInputs = {
  composeVersion: Inputs["composeVersion"];
  cwd: Inputs["cwd"];
  githubToken: Inputs["githubToken"];
};

export type VersionInputs = {
  cwd: Inputs["cwd"];
};

export class DockerComposeInstallerService {
  constructor(private readonly manualInstallerAdapter: ManualInstallerAdapter) {}

  async install({ composeVersion, cwd, githubToken }: InstallInputs): Promise<string> {
    const currentVersion = await this.getInstalledVersion(cwd);

    const needsInstall = !currentVersion || (composeVersion && composeVersion !== currentVersion);
    if (!needsInstall) {
      return currentVersion;
    }

    let targetVersion = composeVersion || COMPOSE_VERSION_LATEST;

    if (targetVersion === COMPOSE_VERSION_LATEST) {
      if (!githubToken) {
        throw new Error("GitHub token is required to install the latest version");
      }
      targetVersion = await this.getLatestVersion(githubToken);
    }

    await this.installVersion(targetVersion);

    return this.version({ cwd });
  }

  private async getInstalledVersion(cwd: string): Promise<string | null> {
    try {
      return await this.version({ cwd });
    } catch {
      return null;
    }
  }

  private async version({ cwd }: VersionInputs): Promise<string> {
    const result = await version({
      cwd,
    });
    return result.data.version;
  }

  private async getLatestVersion(githubToken: string): Promise<string> {
    const octokit = github.getOctokit(githubToken);

    const response = await octokit.rest.repos.getLatestRelease({
      owner: "docker",
      repo: "compose",
    });

    return response.data.tag_name;
  }

  private async installVersion(version: string): Promise<void> {
    switch (process.platform) {
      case "linux":
      case "darwin":
        await this.manualInstallerAdapter.install(version);
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
  }
}
