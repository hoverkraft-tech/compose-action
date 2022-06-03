module.exports.getOptions = (flags) => {
  const options = { config: composeFile, log: true };
  if (flags != null && typeof flags == "string" && flags.length > 0) {
    options["commandOptions"] = flags.split(" ");
  }

  return options;
};
