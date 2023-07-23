const core = require("@actions/core");
const compose = require("docker-compose");
const utils = require("./utils");

// Use docker compose v2
// ref: https://github.com/PDMLab/docker-compose/tree/master#import-for-docker-compose-v2
// The migration of Docker was done with Docker Compose. Use the official plugin instead.
// ref: https://docs.docker.com/compose/migrate/
const composeV2 = compose.v2;

try {
  const composeFiles = utils.parseComposeFiles(
    core.getMultilineInput("compose-file")
  );
  if (!composeFiles.length) {
    return;
  }

  const services = core.getMultilineInput("services", { required: false });

  const options = {
    config: composeFiles,
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("up-flags")),
  };

  const promise =
    services.length > 0
      ? composeV2.upMany(services, options)
      : composeV2.upAll(options);

  promise
    .then(() => {
      console.log("compose started");
    })
    .catch((err) => {
      core.setFailed(`compose up failed ${JSON.stringify(err)}`);
    });
} catch (error) {
  core.setFailed(error.message);
}
