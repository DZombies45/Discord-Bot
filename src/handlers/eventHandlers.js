import path from "path";
import { fileURLToPath } from "url";
import { getAllFiles } from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);

    let eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    if (eventName === "validation") eventName = "interactionCreate";

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        // 🧠 import() harus di-await dan ambil .default-nya
        const module = await import(eventFile);
        const eventFunction = module.default;

        if (typeof eventFunction === "function") {
          await eventFunction(client, arg);
        } else {
          console.warn(`[WARN] ${eventFile} tidak mengekspor fungsi default.`);
        }
      }
    });
  }
};
