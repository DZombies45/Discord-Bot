import { Logger } from "../../util.js";
import { ActivityType } from "discord.js";
import mongoose from "mongoose";

const mongooURL = process.env.MONGOOURL;

export default async (client) => {
  Logger.success(`bot login as ${client.user.username}`);
  let isShuttingDown = false;

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

  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    Logger.info(`Received ${signal}, closing database...`);

    const forceExitTimer = setTimeout(() => {
      Logger.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    client.destroy();
    await mongoose.disconnect();

    clearTimeout(forceExitTimer);
    Logger.info("Shutdown, successully exit");
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};
