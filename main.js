const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');

  if (!fs.existsSync(composeFile)) {
    console.log(`${composeFile} not exists`);
    return
  }

  const upOne = core.getInput('up-one', {required: false});
  const options = { config: composeFile, log: true }

  const promise = upOne ? compose.upOne(upOne, options) : compose.upAll(options);

  promise.then(
      () => { console.log('compose started')},
      err => { core.setFailed(`compose up failed ${err}`)}
    );
} catch (error) {
  core.setFailed(error.message);
}
