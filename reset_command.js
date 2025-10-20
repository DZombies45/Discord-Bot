import { REST, Routes } from "discord.js";
import jsonConfig from "./src/config.json";
const { clientId, guildId } = jsonConfig;
import "dotenv/config";

const rest = new REST().setToken(process.env.TOKEN);

// ...

// for guild-based commands
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log("Successfully deleted all guild commands."))
  .catch(console.error);

// for global commands
rest
  .put(Routes.applicationCommands(clientId), { body: [] })
  .then(() => console.log("Successfully deleted all application commands."))
  .catch(console.error);
