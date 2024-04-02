/**
 * The entrypoint for the action.
 */
import { RunCallback, run } from "./runner";
import { DockerComposeService } from "./services/docker-compose.service";
import { Inputs } from "./services/input.service";
import { LoggerService } from "./services/logger.service";

const callback: RunCallback = async (
  inputs: Inputs,
  loggerService: LoggerService,
  dockerComposeService: DockerComposeService
) => {
  const composeVersion = await dockerComposeService.version(inputs);
  loggerService.info(`docker-compose version: ${composeVersion}`);

  await dockerComposeService.up(inputs);
  loggerService.info("docker-compose is up");
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(callback);
