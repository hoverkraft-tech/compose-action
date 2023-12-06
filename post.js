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

  const options = {
    config: composeFiles,
    cwd: core.getInput("cwd"),
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("down-flags")),
  };

  composeV2.down(options).then(
    () => {
      console.log("compose removed");
    },
    (err) => {
      core.setFailed(`compose down failed ${err}`);
    }
  );
} catch (error) {
  core.setFailed(error.message);
}
