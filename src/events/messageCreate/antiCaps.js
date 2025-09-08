module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  if (message.content.length <= 5) return;
  if (message.content.match(/[A-Z]/g).length / message.content.length < 0.8)
    return;
  //do something
  const a = await message
    .reply("❗ **message contains too many uppercase letters** ❗")
    .catch(() => {});
  await message.delete().catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await a.delete().catch(() => {});
};
