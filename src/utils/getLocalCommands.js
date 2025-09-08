const path = require("path");
const getAllFiles = require("./getAllFiles.js");

module.exports = (exeption = []) => {
  let localCommands = [];
  const commandFolders = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true,
  );

  for (const commandKategori of commandFolders) {
    const cmdKategori = getAllFiles(commandKategori);
    for (const commandFile of cmdKategori) {
      const cmdObject = require(commandFile);
      if (exeption.includes(cmdObject.name)) continue;
      localCommands.push(cmdObject);
    }
  }
  return localCommands;
};
