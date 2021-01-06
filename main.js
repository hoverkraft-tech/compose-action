const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');

  if (!fs.existsSync(composeFile)) {
    console.log(`${composeFile} not exists`);
    return
  }

  compose.upAll({ config: composeFile, log: true })
    .then(
      () => { console.log('compose started')},
      err => { core.setFailed(`compose up failed ${err}`)}
    );
} catch (error) {
  core.setFailed(error.message);
}
