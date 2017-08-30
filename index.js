const TelegramBot = require('node-telegram-bot-api')
const token = '403677977:AAF7c5fPp-Th-c-G5DdWHmNEZOJHTZI4nfc'
const bot = new TelegramBot(token, { polling: true });

let cfg = {}

bot.onText(/\/config/, (msg, match) => {
    if (msg.chat.type != "supergroup") {
        bot.sendMessage(msg.chat.id, "can configure only supergroups")
        return
    }

    let groupCfg
    if (cfg[msg.chat.id]) {
        groupCfg = cfg[msg.chat.id]
    } else {
        cfg[msg.chat.id] = new GroupConfig(msg.chat.id)
        groupCfg = cfg[msg.chat.id]
    }
    bot.deleteMessage(msg.chat.id, msg.message_id)
    bot.sendMessage(msg.from.id, 'ku', {
        reply_markup: getConfigMarkup(groupCfg)
    }).catch((reason) => {
        bot.sendMessage(msg.chat.id, 'Cannot send personal message. Write me something to allow PM\n' + reason)
    });
});

// delete all 'xxx joined to chat' messages 
bot.on('message', (msg) => {
    if (msg.chat.type != 'supergroup') {
        return //we can delete messages only from supergroups 
    }

    if (msg.new_chat_member || msg.left_chat_member) {
        bot.deleteMessage(msg.chat.id, msg.message_id)
    }

    console.dir(msg)
});

bot.on('callback_query', query => {
    console.dir(query)
    let current_config = cfg[JSON.parse(query.data).id]
    let markup = getConfigMarkup(current_config)
    let data = JSON.parse(query.data)
    if(data.joins !== undefined){
        current_config.removeJoins = !current_config.removeJoins
    }
    bot.deleteMessage(query.message.chat.id, query.message.message_id)
    bot.sendMessage(query.from.id, 'ku', {
        reply_markup: markup
    })
})

let getConfigMarkup = function (groupCfg) {
    let joinsBtn = groupCfg.removeJoins ? "✅" : "❎"
    return {
        inline_keyboard: [[{
            text: joinsBtn + " deleting joins",
            callback_data: JSON.stringify({ joins: !groupCfg.removeJoins, id: groupCfg.groupId })
        }]]
    }
}

class GroupConfig {
    constructor(id) {
        this.groupId = id
        this.removeJoins = false
    }
}

