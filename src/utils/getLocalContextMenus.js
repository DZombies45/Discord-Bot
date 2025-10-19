import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "./getAllFiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function getLocalCTMenu(exeption = []) {
  const localContextMenus = [];
  const contextMenuFiles = getAllFiles(
    path.join(__dirname, "..", "contextMenus"),
  );

  for (const contextMenuFile of contextMenuFiles) {
    const { default: ctmObject } = await import(contextMenuFile);
    if (exeption.includes(ctmObject.name)) continue;
    localContextMenus.push(ctmObject);
  }

  return localContextMenus;
}