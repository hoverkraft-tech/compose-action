import { setFailed } from "@actions/core";
import { InputService, Inputs } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import { DockerComposeService } from "./services/docker-compose.service";

export type RunCallback = (
  inputs: Inputs,
  loggerService: LoggerService,
  dockerComposeService: DockerComposeService
) => Promise<void>;

/**
 * The run function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(callback: RunCallback): Promise<void> {
  try {
    const loggerService = new LoggerService();
    const inputService = new InputService();
    const dockerComposeService = new DockerComposeService();

    const inputs = inputService.getInputs();
    loggerService.debug(`inputs: ${JSON.stringify(inputs)}`);

    await callback(inputs, loggerService, dockerComposeService);
  } catch (error) {
    setFailed(`${error instanceof Error ? error : JSON.stringify(error)}`);
  }
}
