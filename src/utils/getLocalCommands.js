import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "./getAllFiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function getLocalCommand(exeption = []) {
  const localCommands = [];
  const commandFolders = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true,
  );

  for (const commandFolder of commandFolders) {
    const cmdFiles = getAllFiles(commandFolder);
    for (const cmdFile of cmdFiles) {
      const { default: cmdObject } = await import(cmdFile);
      if (exeption.includes(cmdObject.name)) continue;
      localCommands.push(cmdObject);
    }
  }

  return localCommands;
}