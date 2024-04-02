/**
 * The entrypoint for the post action.
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
  const { error, output } = await dockerComposeService.logs(inputs);

  if (error) {
    loggerService.debug("compose error:\n" + error);
  }

  loggerService.debug("compose logs:\n" + output);

  await dockerComposeService.down(inputs);

  loggerService.info("compose removed");
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(callback);
