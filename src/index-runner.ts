import { setFailed } from "@actions/core";
import { InputService } from "./services/input.service.js";
import { LoggerService } from "./services/logger.service.js";
import { DockerComposeService } from "./services/docker-compose.service.js";
import { DockerComposeInstallerService } from "./services/docker-compose-installer.service.js";
import { ManualInstallerAdapter } from "./services/installer-adapter/manual-installer-adapter.js";

/**
 * The run function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const loggerService = new LoggerService();
    const inputService = new InputService();
    const dockerComposeInstallerService = new DockerComposeInstallerService(
      new ManualInstallerAdapter()
    );
    const dockerComposeService = new DockerComposeService();

    const inputs = inputService.getInputs();
    loggerService.debug(`inputs: ${JSON.stringify(inputs)}`);

    loggerService.info(
      "Setting up docker compose" +
        (inputs.composeVersion ? ` version ${inputs.composeVersion}` : "")
    );

    const installedVersion = await dockerComposeInstallerService.install({
      composeVersion: inputs.composeVersion,
      cwd: inputs.cwd,
      githubToken: inputs.githubToken,
    });

    loggerService.info(`docker compose version: ${installedVersion}`);

    loggerService.info("Bringing up docker compose service(s)");
    await dockerComposeService.up({
      dockerFlags: inputs.dockerFlags,
      composeFiles: inputs.composeFiles,
      composeFlags: inputs.composeFlags,
      cwd: inputs.cwd,
      upFlags: inputs.upFlags,
      services: inputs.services,
      serviceLogger: loggerService.getServiceLogger(inputs.serviceLogLevel),
    });
    loggerService.info("docker compose service(s) are up");
  } catch (error) {
    setFailed(`${error instanceof Error ? error : JSON.stringify(error)}`);
  }
}
