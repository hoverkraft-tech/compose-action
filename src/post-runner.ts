import { setFailed } from "@actions/core";
import { DockerComposeService } from "./services/docker-compose.service.js";
import { InputService } from "./services/input.service.js";
import { LoggerService } from "./services/logger.service.js";

/**
 * The run function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const loggerService = new LoggerService();
    const inputService = new InputService();
    const dockerComposeService = new DockerComposeService();

    const inputs = inputService.getInputs();

    try {
      const { error } = await dockerComposeService.logs({
        dockerFlags: inputs.dockerFlags,
        composeFiles: inputs.composeFiles,
        composeFlags: inputs.composeFlags,
        cwd: inputs.cwd,
        services: inputs.services,
        serviceLogger: loggerService.getServiceLogger(inputs.serviceLogLevel),
      });

      if (error) {
        loggerService.debug(`docker compose error:\n${error}`);
      }
    } catch (error) {
      loggerService.warn(
        `Unable to collect docker compose logs before cleanup: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }

    await dockerComposeService.down({
      dockerFlags: inputs.dockerFlags,
      composeFiles: inputs.composeFiles,
      composeFlags: inputs.composeFlags,
      cwd: inputs.cwd,
      downFlags: inputs.downFlags,
      serviceLogger: loggerService.getServiceLogger(inputs.serviceLogLevel),
    });

    loggerService.info("docker compose is down");
  } catch (error) {
    setFailed(`${error instanceof Error ? error : JSON.stringify(error)}`);
  }
}
