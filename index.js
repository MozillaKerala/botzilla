var irc = require('irc');
var env = require('./config.js');
var fs = require('fs');
var Bot = require('node-telegram-bot');

//reading meeting status in sync 
var meeting_status = fs.readFileSync('./mod', 'ascii');
//setting up irc configs
var client = new irc.Client(env.server, env.nick, {
    channels: [
    env.channel
  ]
});

//listening for messages from IRC
client.addListener('message', function (from, to, message) {
    console.log(from + ': ' + message);
    if (meeting_status == 'off')
        return;
    bot.sendMessage({
        chat_id: env.tg_chatId,
        text: from + ': ' + message
    })
});

client.addListener('error', function (message) {
    console.log('error: ', message);
});

var bot = new Bot({
    token: env.tgbot_token
}).on('message', function (message) {
    //if message is not text (stickers , image.....) then do nothing
    if (!message.text) {
        return;
    }
    var command = (message.text.split('/')[1]);

    if (command) {
        //remove bot name from the command    
        command = (command.replace(env.tgbot_name, '')).toLowerCase();
    }

    switch (command) {
    case 'startmeeting':
        startmeeting(message.from.id);
        //exit from the function so that the /startmeeting is not send to the IRC
        return;

    case 'stopmeeting':
        stopmeeting(message.from.id);
        return;

    case 'status':
        send_status();
        return;

    default:
        send(message);
    }
}).start();


//send Message to IRC
function send(message) {
    var msg;
    if (meeting_status == 'off')
        return;
    if (message.reply_to_message) {

        msg = message.from.first_name + '(in reply to ' + message.reply_to_message.from.first_name + '): ' + message.text;

    } else {

        msg = message.from.first_name + ': ' + message.text;

    }

    client.say('#kerala_testing', msg);
    console.log(message);

}


function startmeeting(from) {

    if (from !== env.admin_id) {
        return;
    }

    meeting_status = 'on';
    fs.writeFile('./mod', 'on', 'ascii', function (err) {
        //if error retry startmeeting
        if (err) {
            startmeeting(from);
        } else {
            bot.sendMessage({
                chat_id: env.tg_chatId,
                text: 'Meeting Started '
            })
        }
    });
}


function stopmeeting(from) {

    if (from !== env.admin_id) {
        return;
    }

    meeting_status = 'off';
    //write status to mod file
    fs.writeFile('./mod', 'off', 'ascii', function (err) {
        //if error retry stopmeeting
        if (err) {
            startmeeting(from);
        } else {
            bot.sendMessage({
                chat_id: env.tg_chatId,
                text: 'Meeting Stopped '
            })
        }
    });
}

function send_status() {
    bot.sendMessage({
        chat_id: env.tg_chatId,
        parse_mode: 'Markdown',
        text: 'Meeting mode *' + meeting_status.toUpperCase() + '*'
    })
}