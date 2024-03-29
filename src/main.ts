import { debug, setFailed } from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";

export enum RunAction {
  UP = "up",
  DOWN = "down",
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(run: RunAction): Promise<void> {
  try {
    const loggerService = new LoggerService();
    const dockerComposeService = new DockerComposeService();
    const inputService = new InputService(loggerService);

    const inputs = inputService.getInputs();
    debug(`inputs: ${JSON.stringify(inputs)}`);

    if (!inputs.composeFiles.length) {
      loggerService.warn("no compose files found");
      return;
    }

    switch (run) {
      case RunAction.UP:
        await dockerComposeService.up(inputs);
        loggerService.info("compose started");
        break;
      case RunAction.DOWN:
        await dockerComposeService.down(inputs);
        loggerService.info("compose removed");
        break;
    }
  } catch (error) {
    setFailed(`compose ${run} failed. ${error instanceof Error ? error : JSON.stringify(error)}`);
  }
}
