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
    const currentVersion = await this.version({ cwd });

    if (!composeVersion) {
      // If no version is specified and Docker Compose is not installed, throw an error
      if (!currentVersion) {
        throw new Error(
          "Docker Compose is not installed and no compose-version was specified. Please specify a compose-version to install."
        );
      }
      return currentVersion;
    }

    if (currentVersion === composeVersion) {
      return currentVersion;
    }

    if (composeVersion === COMPOSE_VERSION_LATEST) {
      if (!githubToken) {
        throw new Error("GitHub token is required to install the latest version");
      }
      composeVersion = await this.getLatestVersion(githubToken);
    }

    await this.installVersion(composeVersion);

    const installedVersion = await this.version({ cwd });
    if (!installedVersion) {
      throw new Error("Failed to verify Docker Compose installation");
    }
    return installedVersion;
  }

  private async version({ cwd }: VersionInputs): Promise<string | null> {
    try {
      const result = await version({
        cwd,
      });
      return result.data.version;
    } catch {
      // If version check fails (e.g., Docker Compose not installed), return null
      return null;
    }
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
