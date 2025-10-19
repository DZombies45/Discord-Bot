// Load environment variables
import "dotenv/config";

import { chalk } from "chalk";
import { EmbedBuilder, WebhookClient } from "discord.js";

function loadError(client) {
  const wbc = new WebhookClient({
    id: process.env.WEBHOOKID,
    token: process.env.WEBHOOKAPI,
  });

  const errorembed = new EmbedBuilder().setColor("Orange");

  console.log(
    chalk.gray(` ${String(new Date()).split(" ", 5).join(" ")} `) +
      chalk.white("[") +
      chalk.green("INFO") +
      chalk.white("] ") +
      chalk.green("Error Handler") +
      chalk.white(" Loaded!"),
  );

  const sendLog = (title, data) => {
    wbc
      .send({
        embeds: [
          errorembed
            .setTitle(title)
            .setDescription("```js\n" + String(data) + "\n```"),
        ],
      })
      .catch((err) => {
        console.error(chalk.red("[Webhook Error]"), err);
      });
  };

  process.on("beforeExit", (code) => {
    console.log(chalk.yellow("[AntiCrash] | beforeExit =>"), code);
    sendLog("Before Exit Logs", code);
  });

  process.on("exit", (code) => {
    console.log(chalk.yellow("[AntiCrash] | exit =>"), code);
    sendLog("Exit Logs", code);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(chalk.yellow("[AntiCrash] | Unhandled Rejection =>"), reason);
    sendLog("Unhandled Rejection", reason);
  });

  process.on("rejectionHandled", (promise) => {
    console.log(chalk.yellow("[AntiCrash] | Rejection Handled =>"), promise);
    sendLog("Rejection Handled", promise);
  });

  process.on("uncaughtException", (err, origin) => {
    console.log(chalk.yellow("[AntiCrash] | Uncaught Exception =>"), err);
    sendLog("Uncaught Exception", `${err}\nOrigin: ${origin}`);
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(
      chalk.yellow("[AntiCrash] | Uncaught Exception Monitor =>"),
      err,
    );
    sendLog("Uncaught Exception Monitor", `${err}\nOrigin: ${origin}`);
  });

  process.on("warning", (warning) => {
    console.log(chalk.yellow("[AntiCrash] | Warning =>"), warning);
    sendLog("Warning", warning);
  });
}

export { loadError };
