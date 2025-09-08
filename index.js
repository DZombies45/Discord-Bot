const { Client, Events, GatewayIntentBits } = require("discord.js");
const { loadError } = require("./log.js")
const eventHandler = require("./src/handlers/eventHandlers.js");
require("dotenv/config");
const { GlobalFonts } = require("@napi-rs/canvas");
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

module.exports = { startDate };

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
loadError(client)