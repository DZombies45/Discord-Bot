const path = require("path");
const getAllFiles = require("./getAllFiles.js");

module.exports = (exeption = []) => {
  let localeButtons = [];
  const btnFiles = getAllFiles(path.join(__dirname, "..", "buttons"));

  for (const btnFile of btnFiles) {
    const btnObj = require(btnFile);
    if (exeption.includes(btnObj.name)) continue;
    localeButtons.push(btnObj);
  }
  return localeButtons;
};
