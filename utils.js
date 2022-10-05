const fs = require("fs");

module.exports.parseFlags = (flags) => {
  if (flags != null && typeof flags == "string" && flags.length > 0) {
    return flags.split(" ");
  }

  return [];
};

module.exports.parseComposeFiles = (composeFiles) => {
  return composeFiles.filter((composeFile) => {
    if (!composeFile.length) {
      return false;
    }

    if (!fs.existsSync(composeFile)) {
      console.log(`${composeFile} not exists`);
      return false;
    }

    return true;
  });
};
