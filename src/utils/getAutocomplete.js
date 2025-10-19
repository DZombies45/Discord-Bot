import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "./getAllFiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function getLocalAutocomplete(exeption = []) {
  const localAutocomplete = [];
  const autoFiles = getAllFiles(path.join(__dirname, "..", "autocompletes"));

  for (const autoFile of autoFiles) {
    const { default: autoObj } = await import(autoFile);
    if (exeption.includes(autoObj.name)) continue;
    localAutocomplete.push(autoObj);
  }

  return localAutocomplete;
}