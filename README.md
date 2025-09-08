# Discord Bot 2

A Discord bot with

-   ban/kick functionality,
-   minecraft changelog from bedrock and java base on minecraft server anauncement,
-   minigame,
-   virustotal api check,
-   qr reader and maker,
-   and additional features.
-   and uncoming like translate and minigame.

## Table of Contents

-   [About](#about)
-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Dependencies](#dependencies)
-   [Author](#author)
-   [License](#license)

## About

This project is a Discord bot built using [discord.js](https://discord.js.org/) with essential moderation commands like ban and kick, along with other utilities and fun features.

## Features

-   **Moderation**: Ban and kick members.
-   **Translation**: Uses `@iamtraction/google-translate` for language translation.
-   **Game Integration**: Includes mini-games via `discord-gamecord`.
-   **Utilities**: Date handling with `dayjs`, RSS parsing, and more.
-   **Canvas Art**: Custom graphics using `@napi-rs/canvas` and `discord-arts`.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/DZombies45/Discord-Bot
    cd Discord-Bot
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file for environment variables:
    ```plaintext
    CLIENTID=YOUR_DISCORD_BOT_ID
    GUILDID=YOUR_GUILD_ID
    TOKEN=YOUR_DISCORD_TOKEN
    MONGOOURL=YOUR_MONGO_API
    VIRUSAPI=YOUR_VIRUSTOTAL_API
    ```

## Usage

-   Start the bot:

    ```bash
    npm run bot
    ```

-   Reset commands:
    ```bash
    npm run reset
    ```

## Commands

Here are some basic commands the bot supports:

-   **Moderation**

    -   `/moderate <user>`: Moderate a user.
    -   `/banlist`: list of banned user.

-   **Utility**

    -   `/qrr <image>`: Read qr code from image.
    -   `/qrc <text>`: Create a qr code image.
    -   `/check <url>`: Check virus from url

-   **Fun**
    -   `/changelog bedrock-stable <version>`: View changelog for minecraft bedrock.

## Dependencies

-   [discord.js](https://discord.js.org/) - Core library for interacting with Discord API.
-   [@iamtraction/google-translate](https://www.npmjs.com/package/@iamtraction/google-translate) - Translation library.
-   [@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas) - Canvas rendering for Discord graphics.
-   [dayjs](https://www.npmjs.com/package/dayjs) - Date manipulation library.
-   [discord-arts](https://www.npmjs.com/package/discord-arts) - Discord art utilities.
-   [discord-gamecord](https://www.npmjs.com/package/discord-gamecord) - Library for Discord mini-games.
-   [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable loader.
-   [mongoose](https://mongoosejs.com/) - MongoDB object modeling.
-   [node-html-parser](https://www.npmjs.com/package/node-html-parser) - HTML parser for Node.js.
-   [rss-parser](https://www.npmjs.com/package/rss-parser) - RSS feed parser.

## Author

Created by **DZombies45**.

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
