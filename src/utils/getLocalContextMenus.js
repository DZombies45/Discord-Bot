const path = require("path");
const getAllFiles = require("./getAllFiles.js");

module.exports = (exeption = []) => {
  let localContestMenus = [];
  const contextMenuFiles = getAllFiles(
    path.join(__dirname, "..", "contextMenus"),
  );

  for (const contextMenuFile of contextMenuFiles) {
    const ctmObject = require(contextMenuFile);
    if (exeption.includes(ctmObject.name)) continue;
    localContestMenus.push(ctmObject);
  }
  return localContestMenus;
};
