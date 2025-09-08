const formatDate = (d = Date.now()) => {
  const date = new Date(d);
  const [month, day, year] = date.toLocaleDateString().split("/");
  const time = date.toLocaleTimeString();
  return `${year}-${month}-${day} ${time}`;
};
function parseDate(time) {
  let duration = "";
  let Y, M, D, h, m, s;
  let jj = 0;
  while (time > 1000) {
    console.log(time);
    if (jj > 50) break;
    if (time >= 365 * 24 * 60 * 60 * 1000) {
      Y = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
      time -= Y * 365 * 24 * 60 * 60 * 1000;
      duration += `${Y}Y`;
    } else if (time >= 30 * 24 * 60 * 60 * 1000) {
      M = Math.floor(time / (30 * 24 * 60 * 60 * 1000));
      time -= M * 30 * 24 * 60 * 60 * 1000;
      duration += `${M}M`;
    } else if (time >= 24 * 60 * 60 * 1000) {
      D = Math.floor(time / (24 * 60 * 60 * 1000));
      time -= D * 24 * 60 * 60 * 1000;
      duration += `${D}D`;
    } else if (time >= 60 * 60 * 1000) {
      h = Math.floor(time / (60 * 60 * 1000));
      time -= h * 60 * 60 * 1000;
      duration += `${h}h`;
    } else if (time >= 60 * 1000) {
      m = Math.floor(time / (60 * 1000));
      time -= m * 60 * 1000;
      duration += `${m}m`;
    } else if (time >= 1000) {
      s = Math.floor(time / 1000);
      time -= s * 1000;
      duration += `${s}s`;
    }
    jj++;
  }
  return duration;
}
function parseDuration(time) {
  const regex = /(\d+)([smhDMY])/g;
  let duration = 0;
  let match;
  while ((match = regex.exec(time))) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        duration += value * 1000;
        break;
      case "m":
        duration += value * 60 * 1000;
        break;
      case "h":
        duration += value * 60 * 60 * 1000;
        break;
      case "D":
        duration += value * 24 * 60 * 60 * 1000;
        break;
      case "M":
        duration += value * 30.44 * 24 * 60 * 60 * 1000;
        break;
      case "Y":
        duration += value * 365 * 24 * 60 * 60 * 1000;
        break;
    }
  }
  return duration;
}

const { startDate } = require("../index.js");
const recentMentions = new Map();
const fs = require("fs");

const Logger = {
  _log: (name, date, color, ...data) => {
    console.log(
      "\x1B[0m[" +
        formatDate(date) +
        "] \x1B[" +
        color +
        "m\x1B[1m[" +
        name.toUpperCase() +
        "] \x1B[0m-",
      ...data,
    );
  },
  log: (...data) => Logger._log("info", Date.now(), 33, ...data),
  debug: (...data) => Logger._log("debug", Date.now(), 33, ...data),
  warn: (...data) => Logger._log("warning", Date.now(), 33, ...data),
  success: (...data) => Logger._log("success", Date.now(), 32, ...data),
  release: (releaseDate, ...data) =>
    Logger._log("release", releaseDate, 32, ...data),
  error: (...data) => Logger._log("errror", Date.now(), 31, ...data),
};

const trimText = (text, maxLength, addedText = "...") => {
  if (text.length > maxLength)
    return text.slice(0, maxLength - addedText.length) + addedText;
  return text;
};

const chunkSubstr = (str, size) => str.match(new RegExp(`.{1,${size}}`, `g`));

const TabbleConsole = {
  _repeatText: (text, length) => text.repeat(length),
  start: (text) => {
    console.log(
      "+----------------------------------------------+\n|                                              |",
    );
    console.log(
      /*
            `|\x1B[96m${TabbleConsole._repeatText(
                " ",
                (46 - text.length) / 2
            )}${text}${TabbleConsole._repeatText(
                " ",
                Math.ceil((46 - text.length) / 2)
            )}\x1B[0m|`*/
      `|\x1B[96m${padString(text, 46, " ")}\x1B[0m|`,
    );
    console.log(
      "|                                              |\n+---+------------------------------------------+",
    );
  },
  end: () => console.log("+---+------------------------------------------+"),
  add: (icon, text, loading = null) => {
    if (!loading)
      return console.log(
        `| ${icon}\x1B[0m | ${text}${TabbleConsole._repeatText(
          " ",
          41 - text.replace(/\x1B\[\d+m/g, "").length,
        )}|`,
      );
    clearInterval(loading);
    process.stdout.write(
      `\r| ${icon}\x1B[0m | ${text}${TabbleConsole._repeatText(
        " ",
        41 - text.replace(/\x1B\[\d+m/g, "").length,
      )}|\n`,
    );
  },
  showLoading: (text) => {
    const frames = ["-", "\\", "|", "/"];
    let index = 0;

    return setInterval(() => {
      process.stdout.write(
        `\r| ${frames[index]}\x1B[0m | ${text}${TabbleConsole._repeatText(
          " ",
          41 - text.replace(/\x1B\[\d+m/g, "").length,
        )}|`,
      );
      index = (index + 1) % frames.length;
    }, 200);
  },
};

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function padString(str, length, char = " ") {
  const totalPad = length - str.length;
  const padStart = Math.floor(totalPad / 2);
  const padEnd = totalPad - padStart;
  return char.repeat(padStart) + str + char.repeat(padEnd);
}

const cooldown = {
  userCooldown: {},
  start: (interaction, time) => {
    const { name, user } = interaction;
    const cd = cooldown.userCooldown[name] || [];
    if (cd.includes(user.id)) return true;
    cd.push(user.id);
    cooldown.userCooldown[name] = cd;
    setTimeout(() => {
      cooldown.userCooldown[name].shift();
    }, time);
    return false;
  },
  check: (interaction) => {
    const { name, user } = interaction;
    const cd = cooldown.userCooldown[name] || [];
    if (cd.includes(user.id)) return true;
    return false;
  },
  end: (user) => {
    const cd = cooldown.userCooldown[name] || [];
    cd.filter((a) => {
      a !== user.id;
    });
    cd = cooldown.userCooldown[name] = cd;
  },
};

module.exports = {
  Logger,
  recentMentions,
  chunkSubstr,
  formatDate,
  trimText,
  TabbleConsole,
  parseDate,
  parseDuration,
  getRandomColor,
  cooldown,
  padString,
};
