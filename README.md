# Botzilla
The bot that lives in #kerala on MozNet (Mozilla) IRC and the Mozilla Kerala Telegram group.

for Running Botzilla you need:

    Node.js


#### Creating Bot on Telegram

**Step 1**
On Telegram, open the @BotFather profile, and start to talk with “him”. You can open the conversation by [clicking here](https://telegram.me/botfather). If the screen remains empty, update your Telegram client, or write “/start”

**Step 2**
The first thing you’ll have to do is to create a new bot. Type the command “/newbot”.
BotFather will ask you for a bot name and a bot username, username of the bot should always end with the "bot" suffix like “@mozkproxybot”, or “@awsmlistbot” for example.

BotFather will reply with a bot token , you have to copy it


#### Deploying Botzilla

**Step 1**
Clone the repo by copying and pasting the code in your terminal
```
git clone https://github.com/MozillaKerala/botzilla.git

```


**Step 2**

Open the Config.js with your favorite text editor and edit the keys according to your requirement

```
module.exports = {
    tgbot_token: 'bot token you got',
    tgbot_name: '@username of yourbot',
    tg_chatId: 'Chat id of your telegram group',
    server: 'irc network eg: irc.mozilla.org',
    channel: 'irc channel name eg:#kerala_testing',
    nick: 'nick name to use by the bot in IRC eg:botzilla',
    enabled: false,
    admin_id: telegram id of admin,
    admin_name: 'Name of admin'
}

```


**Step 3**
to start botzilla Run the following command on your terminal

```
node index.js

```
