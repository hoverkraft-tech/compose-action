import {
  down,
  IDockerComposeLogOptions,
  IDockerComposeOptions,
  logs,
  upAll,
  upMany,
  version,
} from "docker-compose";
import { Inputs } from "./input.service";

export class DockerComposeService {
  async up(inputs: Inputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(inputs),
      commandOptions: inputs.upFlags,
    };

    if (inputs.services.length > 0) {
      await upMany(inputs.services, options);
      return;
    }

    await upAll(options);
  }

  async down(inputs: Inputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(inputs),
      commandOptions: inputs.downFlags,
    };

    await down(options);
  }

  async logs(inputs: Inputs): Promise<{ error: string; output: string }> {
    const options: IDockerComposeLogOptions = {
      ...this.getCommonOptions(inputs),
      follow: false,
    };

    const { err, out } = await logs(inputs.services, options);

    return {
      error: err,
      output: out,
    };
  }

  async version(inputs: Inputs): Promise<string> {
    const result = await version(this.getCommonOptions(inputs));
    return result.data.version;
  }

  private getCommonOptions(inputs: Inputs): IDockerComposeOptions {
    return {
      config: inputs.composeFiles,
      log: true,
      composeOptions: inputs.composeFlags,
      cwd: inputs.cwd,
    };
  }
}
