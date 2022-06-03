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

  const downFlagsString = core.getInput("down-flags");
  const options = utils.getOptions(downFlagsString);

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
