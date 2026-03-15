import { Client, Events, GatewayIntentBits } from "discord.js";
import eventHandler from "./src/handlers/eventHandlers.js";
import "dotenv/config";
import { GlobalFonts } from "@napi-rs/canvas";
import { loadError } from "./log.js";
import path from "path";
import { fileURLToPath } from "url";
import { startDashboard, emitStats } from "./src/dashboard/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Poppins/Poppins-Regular.ttf`,
  "Poppins",
);
GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Poppins/Poppins-Bold.ttf`,
  "Poppins Bold",
);
GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Manrope/Manrope-Regular.ttf`,
  "Manrope",
);
GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Manrope/Manrope-Bold.ttf`,
  "Manrope Bold",
);
GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Others/AbyssinicaSIL-Regular.ttf`,
  "Abyss",
);
GlobalFonts.registerFromPath(
  `${__dirname}/src/fonts/Others/ChirpRegular.ttf`,
  "Chirp",
);

const formatDate = (d = Date.now()) => {
  const date = new Date(d);
  const [month, day, year] = date.toLocaleDateString().split("/");
  const time = date.toLocaleTimeString();
  return `${year}-${month}-${day} ${time}`;
};

const startDate = formatDate();

export { startDate };

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

eventHandler(client);

client.login(process.env.TOKEN);
loadError(client);

startDashboard();

setInterval(() => {
  const mem = process.memoryUsage();
  emitStats({
    rss: mem.rss,
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    uptime: process.uptime(),
  });
}, 5000);
