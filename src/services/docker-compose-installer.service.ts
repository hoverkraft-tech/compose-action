import { version } from "docker-compose";
import { Inputs } from "./input.service";

export type InstallInputs = {
  composeVersion: Inputs["composeVersion"];
  cwd: Inputs["cwd"];
};

export type VersionInputs = {
  cwd: Inputs["cwd"];
};

export class DockerComposeInstallerService {
  constructor() {}

  async install({ composeVersion, cwd }: InstallInputs): Promise<string> {
    const currentVersion = await this.version({ cwd });
    if (composeVersion && currentVersion !== composeVersion) {
      throw new Error(
        `Requested version ${composeVersion} does not match current version ${currentVersion}`
      );
    }

    return currentVersion;
  }

  private async version({ cwd }: VersionInputs): Promise<string> {
    const result = await version({
      cwd,
    });
    return result.data.version;
  }
}
