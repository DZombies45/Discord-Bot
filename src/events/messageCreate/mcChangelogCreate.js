import bedrockCreate from "../../minecraft/mcbeChangelog.js";
import javaCreate from "../../minecraft/mcjavaChangelog.js";
import { Utils } from "../../mc.js";
import Config from "../../config.json" with { type: "json" };

export default async (client, message) => {
  //if (!message.guild || message.author.id !== "1176044408139939850") return;
  if (message.author.id === client.user.id) return;
  if (!message.guild) return;
  if (
    message.channelId !== Config.bedrockNews &&
    message.channelId !== Config.javaNews
  )
    return;
  const contentArr = message.content.split("\n");

  switch (message.channelId) {
    case Config.bedrockNews:
      bedrockCreate(client, contentArr);
      break;
    case Config.javaNews:
      javaCreate(client, contentArr);
      break;

    default:
      Utils.Logger.error(message.channelId + " not match any");
  }

  //message.channel.send({ embeds: [embed] });
};
