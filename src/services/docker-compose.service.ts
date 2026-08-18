import { spawn } from "node:child_process";
import {
  down,
  type IDockerComposeOptions,
  type IDockerComposeResult,
  upAll,
  upMany,
} from "docker-compose";
import type { Inputs } from "./input.service.js";

type OptionsInputs = {
  dockerFlags: Inputs["dockerFlags"];
  composeFiles: Inputs["composeFiles"];
  composeFlags: Inputs["composeFlags"];
  cwd: Inputs["cwd"];
  serviceLogger: (message: string) => void;
};

export type UpInputs = OptionsInputs & {
  upFlags: Inputs["upFlags"];
  services: Inputs["services"];
};
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
    const options = this.getCommonOptions(optionsInputs);
    const { executablePath, executableArgs } =
      this.getDockerComposeCommandExecution("logs", services, options);

    return new Promise((resolve) => {
      let settled = false;
      const childProcess = spawn(executablePath, executableArgs, {
        cwd: options.cwd,
      });

      childProcess.on("error", (error) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve({
          error: `Unable to collect docker compose logs: ${error.message}`,
          output: "",
        });
      });

      if (!childProcess.stdout || !childProcess.stderr) {
        settled = true;
        resolve({
          error:
            "Unable to collect docker compose logs: stdout/stderr unavailable",
          output: "",
        });
        return;
      }

      childProcess.stdout.on("data", (chunk: Buffer | string) => {
        options.callback?.(Buffer.from(chunk), "stdout");
      });

      childProcess.stderr.on("data", (chunk: Buffer | string) => {
        options.callback?.(Buffer.from(chunk), "stderr");
      });

      childProcess.on("close", (exitCode, signal) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve({
          error: signal
            ? `Docker Compose logs command failed with signal ${signal}`
            : exitCode !== null && exitCode !== 0
              ? `Docker Compose logs command failed with exit code ${exitCode}`
              : "",
          output: "",
        });
      });
    });
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
    return new Error(this.getDockerComposeErrorMessage(error));
  }

  private getDockerComposeCommandExecution(
    command: string,
    commandArgs: string[],
    options: IDockerComposeOptions,
  ): {
    executablePath: string;
    executableArgs: string[];
  } {
    const composeArgs = [
      ...this.getComposeOptionArgs(options.composeOptions),
      ...this.getConfigArgs(options.config),
      command,
      ...this.getComposeOptionArgs(options.commandOptions),
      ...commandArgs,
    ];

    if (options.executable?.standalone) {
      return {
        executablePath: options.executable.executablePath ?? "docker-compose",
        executableArgs: composeArgs,
      };
    }

    return {
      executablePath: options.executable?.executablePath ?? "docker",
      executableArgs: [
        ...this.getComposeOptionArgs(options.executable?.options),
        "compose",
        ...composeArgs,
      ],
    };
  }

  private getConfigArgs(config: IDockerComposeOptions["config"]): string[] {
    if (typeof config === "undefined") {
      return [];
    }

    if (typeof config === "string") {
      return ["-f", config];
    }

    return config.flatMap((item) => ["-f", item]);
  }

  private getComposeOptionArgs(
    composeOptions:
      | IDockerComposeOptions["composeOptions"]
      | IDockerComposeOptions["commandOptions"]
      | NonNullable<IDockerComposeOptions["executable"]>["options"],
  ): string[] {
    if (!composeOptions) {
      return [];
    }

    return composeOptions.flatMap((option) =>
      Array.isArray(option) ? option : [option],
    );
  }

  private getDockerComposeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (this.isDockerComposeResult(error)) {
      const parts: string[] = [];

      if (error.exitCode !== null) {
        parts.push(
          `Docker Compose command failed with exit code ${error.exitCode}`,
        );
      } else {
        parts.push("Docker Compose command failed");
      }

      if (error.err?.trim()) {
        parts.push("\nError output:");
        parts.push(error.err.trim());
      }

      if (error.out?.trim() && error.out !== error.err) {
        parts.push("\nStandard output:");
        parts.push(error.out.trim());
      }

      return parts.join("\n");
    }

    if (typeof error === "string") {
      return error;
    }

    return JSON.stringify(error);
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
