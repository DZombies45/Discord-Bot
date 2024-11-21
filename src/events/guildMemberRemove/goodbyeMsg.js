const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { profileImage } = require("discord-arts");
const { goodbye } = require("../../config.json");
const { goodbyeMessage } = require("../../messageConfig.json");

module.exports = async (client, member) => {
    const channel = member.guild.channels.cache.get(goodbye.ch);
    if (!channel) return;

    const msg = goodbyeMessage[
        Math.floor(Math.random() * goodbyeMessage.length)
    ].replace(/<user>/g, member.user.username);

    const img = await profileImage(member.user.id, {
        borderColor: goodbye.color,
        customTag: msg,
        customDate: new Date().toLocaleDateString(),
        removeAvatarFrame: true,
        customBackground:
            "https://media.discordapp.net/attachments/1046721681445638224/1241817497754271785/Hyperion_mount.png?ex=664b942b&is=664a42ab&hm=70b2a9e7756d9f8a04e13712a08325deed8819d7dffc4e616f7618a2fe728dec&"
    });

    await channel.send({
        files: [{ attachment: img, name: "touch_grass.png" }]
    });
};
