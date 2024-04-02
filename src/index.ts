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
  await dockerComposeService.up(inputs);
  loggerService.info("compose started");
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(callback);
