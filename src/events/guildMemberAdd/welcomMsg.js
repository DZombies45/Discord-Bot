const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { profileImage } = require("discord-arts");
const { welcome } = require("../../config.json");
const { welcomeMessage } = require("../../messageConfig.json");

module.exports = async (client, member) => {
    const channel = member.guild.channels.cache.get(welcome.ch);
    if (!channel) return;

    const msg = welcomeMessage[
        Math.floor(Math.random() * welcomeMessage.length)
    ].replace(/<user>/g, member.user.username);

    const img = await profileImage(member.user.id, {
        borderColor: welcome.color,
        customTag: msg,
        customDate: new Date().toLocaleDateString(),
        removeAvatarFrame: true,
        customBackground:
            "https://media.discordapp.net/attachments/1046721681445638224/1241817497238241473/hyperion_bridge.png?ex=664b942b&is=664a42ab&hm=c89cc132764db998a107d557b0065e816b31452533c2739dd90c902ae44d9ba5&"
    });

    await channel.send({ files: [{ attachment: img, name: "on_bridge.png" }] });
};
