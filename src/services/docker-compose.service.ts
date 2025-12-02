import {
  down,
  IDockerComposeLogOptions,
  IDockerComposeOptions,
  IDockerComposeResult,
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

    try {
      if (services.length > 0) {
        await upMany(services, options);
        return;
      }

      await upAll(options);
    } catch (error) {
      throw this.formatDockerComposeError(error);
    }
  }

  async down({ downFlags, ...optionsInputs }: DownInputs): Promise<void> {
    const options: IDockerComposeOptions = {
      ...this.getCommonOptions(optionsInputs),
      commandOptions: downFlags,
    };

    try {
      await down(options);
    } catch (error) {
      throw this.formatDockerComposeError(error);
    }
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

  /**
   * Formats docker-compose errors into proper Error objects with readable messages
   */
  private formatDockerComposeError(error: unknown): Error {
    // If it's already an Error, return it
    if (error instanceof Error) {
      return error;
    }

    // Handle docker-compose result objects
    if (this.isDockerComposeResult(error)) {
      const parts: string[] = [];

      // Add exit code information
      if (error.exitCode !== null) {
        parts.push(`Docker Compose command failed with exit code ${error.exitCode}`);
      } else {
        parts.push("Docker Compose command failed");
      }

      // Add error stream output if available
      if (error.err && error.err.trim()) {
        parts.push("\nError output:");
        parts.push(error.err.trim());
      }

      // Add standard output if available and different from error output
      if (error.out && error.out.trim() && error.out !== error.err) {
        parts.push("\nStandard output:");
        parts.push(error.out.trim());
      }

      return new Error(parts.join("\n"));
    }

    // Handle string errors
    if (typeof error === "string") {
      return new Error(error);
    }

    // Fallback for unknown error types
    return new Error(JSON.stringify(error));
  }

  /**
   * Type guard to check if an object is a docker-compose result
   */
  private isDockerComposeResult(error: unknown): error is IDockerComposeResult {
    return (
      typeof error === "object" &&
      error !== null &&
      "exitCode" in error &&
      "err" in error &&
      "out" in error
    );
  }
}
