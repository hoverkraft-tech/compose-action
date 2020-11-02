const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');

  if (!fs.existsSync(composeFile)) {
    core.setFailed(`${composeFile} not exists`);
  }

  compose.down({ config: composeFile, log: true })
    .then(
      () => { console.log('compose removed')},
      err => { core.setFailed(`compose down failed ${err}`)}
    );
} catch (error) {
  core.setFailed(error.message);
}
