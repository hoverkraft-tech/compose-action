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

  const services = core.getMultilineInput("services", { required: false });

  const upFlagsString = core.getInput("up-flags");
  const options = utils.getOptions(composeFile, upFlagsString);

  const promise =
    services.length > 0
      ? compose.upMany(services, options)
      : compose.upAll(options);

  promise
    .then(() => { console.log("compose started"); })
    .catch((err) => { core.setFailed(`compose up failed ${err}`); });
} catch (error) {
  core.setFailed(error.message);
}
