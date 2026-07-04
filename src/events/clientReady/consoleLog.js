import { Logger } from "../../util.js";
import { ActivityType } from "discord.js";
import mongoose from "mongoose";

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

  mongoose.connection.on("error", (err) => {
    Logger.error(`mongoose connection error\n${err.stack}`);
  });

  mongoose.connection.on("disconnected", () => {
    Logger.log("mongoose disconnected, reconnecting...");
  });

  mongoose.connection.on("reconnected", () => {
    Logger.success("mongoose reconnected");
  });

  const mongooseOpt = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000, // ping Atlas tiap 10 detik, jaga koneksi tetap hidup
  };

  await mongoose
    .connect(mongooURL, mongooseOpt)
    .then(() => {
      Logger.success(`database connected`);
    })
    .catch((e) => {
      Logger.error(`fail to connect to database\n${e.stack}`);
    });
};
