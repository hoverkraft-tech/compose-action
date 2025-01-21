import { setFailed } from "@actions/core";
import { InputService } from "./services/input.service";
import { LoggerService } from "./services/logger.service";
import { DockerComposeService } from "./services/docker-compose.service";

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

    const { error, output } = await dockerComposeService.logs({
      dockerFlags: inputs.dockerFlags,
      composeFiles: inputs.composeFiles,
      composeFlags: inputs.composeFlags,
      cwd: inputs.cwd,
      services: inputs.services,
      debug: loggerService.debug,
    });

    if (error) {
      loggerService.debug("docker compose error:\n" + error);
    }

    loggerService.debug("docker compose logs:\n" + output);

    await dockerComposeService.down({
      dockerFlags: inputs.dockerFlags,
      composeFiles: inputs.composeFiles,
      composeFlags: inputs.composeFlags,
      cwd: inputs.cwd,
      downFlags: inputs.downFlags,
      debug: loggerService.debug,
    });

    loggerService.info("docker compose is down");
  } catch (error) {
    setFailed(`${error instanceof Error ? error : JSON.stringify(error)}`);
  }
}
