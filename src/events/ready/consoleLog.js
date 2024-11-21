const { Logger } = require("../../util.js");
const mongoose = require("mongoose");
const mongooURL = process.env.MONGOOURL;

module.exports = async client => {
    Logger.success(`bot login as ${client.user.username}`);

    client.user.setStatus("dnd");

    if (!mongooURL) return;
    Logger.log(`connecting to db...`);
    mongoose.set("strictQuery", true);

    await mongoose
        .connect(mongooURL)
        .then(() => {
            Logger.success(`database connected`);
        })
        .catch(e => {
            Logger.error(`fail to connect to database\n${e.stack}`);
        });
};
