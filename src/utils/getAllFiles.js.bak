const path = require("path");
const fs = require("fs");

module.exports = (dir, folderOnly = false) => {
  let fileName = [];
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((file) => !file.name.startsWith("."));

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (folderOnly) {
      if (file.isDirectory()) {
        fileName.push(filePath);
      }
    } else {
      if (file.isFile()) {
        fileName.push(filePath);
      }
    }
  }
  return fileName;
};
