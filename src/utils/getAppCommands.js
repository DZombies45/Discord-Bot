module.exports = async (client, guildId) => {
    let appCmds;

    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        appCmds = guild.commands;
    } else {
        appCmds = client.aplication.commands;
    }

    await appCmds.fetch();
    return appCmds;
};