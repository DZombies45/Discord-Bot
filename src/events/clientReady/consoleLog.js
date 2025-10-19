import { Logger } from "../../util.js";
import { ActivityType } from "discord.js";
import { mongoose  } from "mongoose";
const mongooURL = process.env.MONGOOURL;

export default async (client) => {
  Logger.success(`bot login as ${client.user.username}`);

  client.user.setPresence({
    activities: [
      {
        name: "waiting...",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/@dzombies45",
      },
    ],
    status: "idle",
  });

  if (!mongooURL) return;
  Logger.log(`connecting to db...`);
  mongoose.set("strictQuery", true);

  await mongoose
    .connect(mongooURL)
    .then(() => {
      Logger.success(`database connected`);
    })
    .catch((e) => {
      Logger.error(`fail to connect to database\n${e.stack}`);
    });
};
