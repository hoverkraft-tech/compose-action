import {
  down,
  IDockerComposeLogOptions,
  IDockerComposeOptions,
  logs,
  upAll,
  upMany,
} from "docker-compose";
import { Inputs } from "./input.service";

type OptionsInputs = {
  dockerFlags: Inputs["dockerFlags"];
  composeFiles: Inputs["composeFiles"];
  composeFlags: Inputs["composeFlags"];
  cwd: Inputs["cwd"];
  serviceLogger: (message: string) => void;
};

export type UpInputs = OptionsInputs & { upFlags: Inputs["upFlags"]; services: Inputs["services"] };
export type DownInputs = OptionsInputs & { downFlags: Inputs["downFlags"] };
export type LogsInputs = OptionsInputs & { services: Inputs["services"] };

export class DockerComposeService {
  async up({ upFlags, services, ...optionsInputs }: UpInputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(optionsInputs),
      commandOptions: upFlags,
    };

    if (services.length > 0) {
      await upMany(services, options);
      return;
    }

    await upAll(options);
  }

  async down({ downFlags, ...optionsInputs }: DownInputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(optionsInputs),
      commandOptions: downFlags,
    };

    await down(options);
  }

  async logs({ services, ...optionsInputs }: LogsInputs): Promise<{
    error: string;
    output: string;
  }> {
    const options: IDockerComposeLogOptions = {
      ...this.getCommonOptions(optionsInputs),
      follow: false,
    };

    const { err, out } = await logs(services, options);

    return {
      error: err,
      output: out,
    };
  }

  private getCommonOptions({
    dockerFlags,
    composeFiles,
    composeFlags,
    cwd,
    serviceLogger,
  }: OptionsInputs): IDockerComposeOptions {
    return {
      config: composeFiles,
      composeOptions: composeFlags,
      cwd: cwd,
      callback: (chunk) => serviceLogger(chunk.toString()),
      executable: {
        executablePath: "docker",
        options: dockerFlags,
      },
    };
  }
}
