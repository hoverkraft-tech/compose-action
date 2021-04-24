const core = require('@actions/core');
const compose = require('docker-compose');
const fs = require('fs');

try {
  const composeFile = core.getInput('compose-file');
  const downFlagsString = core.getInput('down-flags');

  let options = { config: composeFile, log: true};
  if (downFlagsString.length > 0)
    options['commandOptions'] = downFlagsString.split(" ");

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
