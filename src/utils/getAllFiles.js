import fs from "fs";
import path from "path";

export function getAllFiles(dir, folderOnly = false) {
  const fileNames = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (folderOnly && entry.isDirectory()) {
      fileNames.push(fullPath);
    } else if (!folderOnly && entry.isFile()) {
      fileNames.push(fullPath);
    }
  }

  return fileNames;
}