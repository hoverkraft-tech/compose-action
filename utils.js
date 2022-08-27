module.exports.parseFlags = (flags) => {
  if (flags != null && typeof flags == "string" && flags.length > 0) {
    return flags.split(" ");
  }

  return [];
};
