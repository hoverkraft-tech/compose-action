const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');
  const downOptions = core.getInput('down-options').split(" ");

  if (!fs.existsSync(composeFile)) {
    console.log(`${composeFile} not exists`);
    return
  }

  compose.down({ config: composeFile, log: true, commandOptions: downOptions })
    .then(
      () => { console.log('compose removed')},
      err => { core.setFailed(`compose down failed ${err}`)}
    );
} catch (error) {
  core.setFailed(error.message);
}
