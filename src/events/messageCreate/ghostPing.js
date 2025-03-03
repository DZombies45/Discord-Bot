const { recentMentions } = require("../../util.js");

module.exports = async (client, message) => {
  if (message.mentions.users.size > 0) {
    recentMentions.set(message.id, {
      content: message.content,
      author: message.author.id,
      mentions: Array.from(message.mentions.users.values()).map(
        (user) => user.id,
      ),
      timestamp: message.createdTimestamp,
    });

    setTimeout(() => {
      recentMentions.delete(message.id);
    }, 60000);
  }
};
