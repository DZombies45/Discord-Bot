import fs from "fs";
import pino from "pino";
import chalk from "chalk";
import { format } from "date-fns";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Buat folder logs ===
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// === Nama file log berdasarkan tanggal ===
const logFile = path.join(
  logDir,
  `bot-${format(new Date(), "yyyy-MM-dd")}.log`,
);

// === Pino setup ===
const fileStream = pino.destination({
  dest: logFile,
  sync: false, // async write = lebih ringan
});

const fileLogger = pino(
  {
    level: "info",
    base: null, // biar log ringkas
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileStream,
);

// === Warna CLI helper ===
const COLORS = {
  info: 33,
  debug: 36,
  warning: 33,
  success: 32,
  error: 31,
};

function formatDate(date = Date.now()) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

// === Logger utama ===
const Logger = {
  _log(name, color, ...data) {
    const line = `[${formatDate(new Date())}] [${name.toUpperCase()}] - ${data.join(" ")}`;
    console.log(`\x1b[${color}m${line}\x1b[0m`);
    fileLogger.info({ name, message: data.join(" ") });
  },
  log: (...data) => Logger.info(...data),
  info: (...data) => Logger._log("INFO", COLORS.info, ...data),
  debug: (...data) => Logger._log("DEBUG", COLORS.debug, ...data),
  warn: (...data) => Logger._log("WARN", COLORS.warning, ...data),
  success: (...data) => Logger._log("SUCCESS", COLORS.success, ...data),
  error: (...data) => Logger._log("ERROR", COLORS.error, ...data),
  release: (releaseDate, ...data) =>
    Logger._log("RELEASE", COLORS.debug, releaseDate, ...data),
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

const recentMentions = new Map();

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

export {
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
