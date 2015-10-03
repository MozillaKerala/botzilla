var irc = require('irc');
var env = require('config.js');
var TelegramBot = require('node-telegram-bot-api');

//setting up irc configs
var client = new irc.Client(env.server, env.nick, {
    channels: [env.channel]
});

//setting up Telegram Bot
var bot = new TelegramBot(env.tgbot_token, {
    polling: true
});


bot.on('text', function (msg) {
    var chatId = msg.chat.id;

//    if (chatId != env.chatId) {
//
//        //msg from unknow telegram chat
//        return;
//
//    }
//
//    
//    
//    
//    if (!env.enabled) {
//
//        return;
//    }

console.log(msg);
    

});
