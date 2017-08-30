const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')

const bot = new TelegramBot(config.bot_token, { polling: true });


// delete messages according on filters
bot.on('message', (msg) => {
    if (msg.chat.type != 'supergroup') {
        return //we can delete messages only from supergroups 
    }

    if (isJoinedMessage(msg) || isArabicMessage(msg) || isUrlMessage(msg)) {
        bot.deleteMessage(msg.chat.id, msg.message_id)
    }

    console.dir(msg) // debug output
});


// checks if message is 'user joined/left to jroup' 
let isJoinedMessage = function (msg) {
    return msg.new_chat_member !== undefined || msg.left_chat_member !== undefined
}

// checks if message contains arabic symbols
let isArabicMessage = function (msg) {
    return /[\u0600-\u06FF]/.test(msg.text) // testing on 'arabic' regex
}

// cheks if message contains url
let isUrlMessage = function (msg) {
    if (msg.entities) {
        for (let e of msg.entities) {
            if (e.type == 'url') { // url messages have type 'url'
                return true
            }
        }
    }
    return false
}
