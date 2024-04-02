import { IDockerComposeLogOptions, IDockerComposeOptions, v2 } from "docker-compose";
import { Inputs } from "./input.service";

export class DockerComposeService {
  async up(inputs: Inputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(inputs),
      commandOptions: inputs.upFlags,
    };

    if (inputs.services.length > 0) {
      await v2.upMany(inputs.services, options);
      return;
    }

    await v2.upAll(options);
  }

  async down(inputs: Inputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(inputs),
      commandOptions: inputs.downFlags,
    };

    await v2.down(options);
  }

  async logs(inputs: Inputs): Promise<{ error: string; output: string }> {
    const options: IDockerComposeLogOptions = {
      ...this.getCommonOptions(inputs),
      follow: false,
    };

    const { err, out } = await v2.logs(inputs.services, options);

    return {
      error: err,
      output: out,
    };
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
