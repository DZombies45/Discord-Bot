// Load environment variables
import "dotenv/config";
import { EmbedBuilder, WebhookClient } from "discord.js";
import chalk from "chalk";
import { Logger } from "./src/util.js";

let wbc = null;

function loadError() {
  wbc = new WebhookClient({
    id: process.env.WEBHOOKID,
    token: process.env.WEBHOOKAPI,
  });

  Logger.info("Error handler loaded.");

  const handle = (label, data) => {
    Logger.error(`[${label}]`, data);
    sendLog(label, data);
  };

  process.on("beforeExit", (code) => handle("Before Exit", code));
  process.on("exit", (code) => handle("Exit", code));
  process.on("unhandledRejection", (reason) =>
    handle("Unhandled Rejection", reason),
  );
  process.on("rejectionHandled", (promise) =>
    handle("Rejection Handled", promise),
  );
  process.on("uncaughtException", (err, origin) =>
    handle("Uncaught Exception", `${err}\nOrigin: ${origin}`),
  );
  process.on("uncaughtExceptionMonitor", (err, origin) =>
    handle("Uncaught Exception Monitor", `${err}\nOrigin: ${origin}`),
  );
  process.on("warning", (warning) => handle("Warning", warning));
}

function sendLog(title, data) {
  if (!wbc) return;
  const embed = new EmbedBuilder().setColor("Orange");
  wbc
    .send({
      embeds: [
        embed
          .setTitle(title)
          .setDescription("```js\n" + String(data) + "\n```"),
      ],
    })
    .catch((err) => {
      Logger.error("[Webhook Error]", err);
    });
}

export { loadError, sendLog };
