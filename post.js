const core = require("@actions/core");
const compose = require("docker-compose");
const fs = require("fs");
const utils = require("./utils");

try {
  const composeFile = core.getInput("compose-file");
  if (!fs.existsSync(composeFile)) {
    console.log(`${composeFile} not exists`);
    return;
  }

  const options = {
    config: composeFile,
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("up-flags")),
  };

  compose.down(options).then(
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
