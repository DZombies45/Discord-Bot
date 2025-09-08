const path = require("path");
const getAllFiles = require("./getAllFiles.js");

module.exports = (exeption = []) => {
  let localAutocomplete = [];
  const autoFiles = getAllFiles(path.join(__dirname, "..", "autocompletes"));

  for (const autoFile of autoFiles) {
    const autoObj = require(autoFile);
    if (exeption.includes(autoObj.name)) continue;
    localAutocomplete.push(autoObj);
  }
  return localAutocomplete;
};
