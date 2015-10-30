var irc = require('irc');
var env = require('./config.js');
var fs = require('fs');
var Bot = require('node-telegram-bot');
var moment = require('moment');
var filename = '';

var meeting_time = moment().format('hh:mm A');
var meeting_date = moment().format('DD MMM YY');
var meeting_link ='https://public.etherpad-mozilla.org/p/kerala-'+ moment().format('DDMMMYY');
var meeting_logs =' logs.mozillakerala.org/'+ moment().format('DDMMMYY');
var wstream;


filename = './logs/' + moment().format('DDMMMYY') + '.txt';
console.log(filename);
wstream = fs.createWriteStream(filename, options);

//options for logging
var options = {
    encoding: 'utf8',
    flags: 'a'
};



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

    add_log(from + ': ' + message + '\n')
});


//log errors
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

    client.say(env.channel, msg);
    msg += '\n';
    add_log(msg);
    console.log(message);

}


function startmeeting(from) {

    if (from !== env.admin_id) {
        return;
    }

    meeting_status = 'on';

    //start logging to file
    filename = './logs/' + moment().format('DDMMMYY') + '.txt';

    wstream = fs.createWriteStream(filename, options);

    fs.writeFile('./mod', 'on', 'ascii', function (err) {
        //if error retry startmeeting
        if (err) {
            startmeeting(from);
        } else {


            meeting_time = moment().format('hh:mm A');
            meeting_date = moment().format('DD MMM YY');
            meeting_link ='https://public.etherpad-mozilla.org/p/kerala-' + moment().format('DDMMMYY');




            var meeting_msg = strformat("A Meeting was just started by %admin_name% at %time% on %date%\n\nThe agenda of the meeting is at %datelink%\n\nYou better be civil from now onwards because I'm logging everything you say.\n\nI'll tell you where to find the log after the meeting ends.", {
                time:meeting_time ,
                date: meeting_date,
                datelink:meeting_link,
admin_name:env.admin_name
            });

            bot.sendMessage({
                chat_id: env.tg_chatId,
                text: meeting_msg
            })

            send({from:{first_name:env.admin_name},text:meeting_msg});

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
            
            
                        var meeting_msg = strformat("The meeting that %admin_name% started and chaired from %time% %date% has ended.\nYou can find the public logs of the meeting at %loglink%", {
                time:meeting_time ,
                date: meeting_date,
                loglink:meeting_logs,
admin_name:env.admin_name
            });
            
            send({from:{first_name:env.admin_name},text:meeting_msg});
            
            bot.sendMessage({
                chat_id: env.tg_chatId,
                text: meeting_msg
            })


            
            //stop logging to file
            wstream.end();
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



function add_log(msg) {

    wstream.write(msg);

}

function strformat(str, obj) {

    for (key in obj) {

        str = str.replace(new RegExp('%' + key + '%', 'g'), obj[key]);


    }

    return str;
}
