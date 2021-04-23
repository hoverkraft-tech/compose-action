const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');
  const downOptionsString = core.getInput('down-options');

  let options = { config: composeFile, log: true};
  if (downOptionsString.length > 0)
    options['commandOptions'] = downOptionsString.split(" ");

  if (!fs.existsSync(composeFile)) {
    console.log(`${composeFile} not exists`);
    return
  }

  compose.down(options)
    .then(
      () => { console.log('compose removed')},
      err => { core.setFailed(`compose down failed ${err}`)}
    );
} catch (error) {
  core.setFailed(error.message);
}
