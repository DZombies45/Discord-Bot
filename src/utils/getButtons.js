import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "./getAllFiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function getLocalBtn(exeption = []) {
  const localeButtons = [];
  const btnFiles = getAllFiles(path.join(__dirname, "..", "buttons"));

  for (const btnFile of btnFiles) {
    const { default: btnObj } = await import(btnFile);
    if (exeption.includes(btnObj.name)) continue;
    localeButtons.push(btnObj);
  }

  return localeButtons;
}