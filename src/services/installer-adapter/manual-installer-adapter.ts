import { exec } from "@actions/exec";
import { mkdirP } from "@actions/io";
import { basename } from "path";
import { cacheFile, downloadTool } from "@actions/tool-cache";
import { DockerComposeInstallerAdapter } from "./docker-compose-installer-adapter";

export class ManualInstallerAdapter implements DockerComposeInstallerAdapter {
  async install(version: string): Promise<void> {
    const dockerComposePluginPath = await this.getDockerComposePluginPath();

    // Create the directory if it doesn't exist
    await mkdirP(basename(dockerComposePluginPath));

    await this.downloadFile(version, dockerComposePluginPath);
    await exec(`chmod +x ${dockerComposePluginPath}`);
    await cacheFile(dockerComposePluginPath, "docker-compose", "docker-compose", version);
  }

  private async getDockerComposePluginPath(): Promise<string> {
    const dockerConfig = process.env.DOCKER_CONFIG || `${process.env.HOME}/.docker`;

    const dockerComposePluginPath = `${dockerConfig}/cli-plugins/docker-compose`;
    return dockerComposePluginPath;
  }

  private async downloadFile(version: string, installerPath: string): Promise<void> {
    if (!version.startsWith("v") && parseInt(version.split(".")[0], 10) >= 2) {
      version = `v${version}`;
    }

    const system = await this.getSystem();
    const hardware = await this.getHardware();

    const url = `https://github.com/docker/compose/releases/download/${version}/docker-compose-${system}-${hardware}`;
    await downloadTool(url, installerPath);
  }

  private async getSystem(): Promise<string> {
    return this.runCommand("uname -s");
  }

  private async getHardware(): Promise<string> {
    return this.runCommand("uname -m");
  }

  private async runCommand(command: string): Promise<string> {
    let output = "";
    const result = await exec(command, [], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    });
    if (result !== 0) {
      throw new Error(`Failed to run command: ${command}`);
    }
    return output.trim();
  }
}
