const { Client, Events, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./src/handlers/eventHandlers.js");
const { Mongoose } = require("mongoose");
require("dotenv/config");
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
