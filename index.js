const config = require('./config')
// database connectivity
var MongoClient = require('mongodb').MongoClient
const TelegramBot = require('node-telegram-bot-api')

var mongoGroups, mongoMessages
const bot = new TelegramBot(config.bot_token, { polling: { autoStart: false } }) //

MongoClient.connect(config.mongo_connection).then(function (db) { // first - connect to database
    mongoGroups = db.collection('groups')
    mongoMessages = db.collection('messages')
    mongoMessages.createIndex({postedDate: 1}, { expireAfterSeconds: 10 }).then(() => {
        bot.startPolling() //then start bot
    })
}).catch(function (e) {
    console.log("FATAL :: " + e)
})

bot.onText(/\/config/, function (msg, match) { // request configuration keyboard to PM
    if (msg.chat.type == 'supergroup') {
        bot.getChatAdministrators(msg.chat.id).then((admins) => { // get list of admins
            if (admins.filter(x => x.user.id == msg.from.id).length > 0) { // if sender is admin
                getConfigKeyboard(msg.chat.id).then(kbd => { // prepare keyboard
                    bot.sendMessage(msg.from.id, `*${msg.chat.title}*`, { // and sent it
                        parse_mode: "markdown",
                        reply_markup: kbd
                    })
                })
            }
        })

    } else if (msg.chat.type == 'private') {
        bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure")
    }
})

// delete messages according on filters
bot.on('message', (msg) => {
    if (msg.chat.type != 'supergroup') {
        return //we can delete messages only from supergroups 
    }
    mongoGroups.findOne({ groupId: msg.chat.id }).then(res => { // load group configuration
        msg.cfg = res

        if (isJoinedMessage(msg) || isArabicMessage(msg) || isUrlMessage(msg) || isCommand(msg)) {
            bot.deleteMessage(msg.chat.id, msg.message_id)
        }
    })

    console.dir(msg) // debug output
})

// buttons response in menu
bot.on('callback_query', query => {
    let groupId = Number(query.data.split("#")[0])
    let prop = query.data.split("#")[1] // get info from button
    mongoGroups.findOne({ groupId: groupId }).then(g => {
        let val = !g[prop] // switch selected button
        mongoGroups.updateOne({ groupId: groupId }, { $set: { [prop]: val } }).then(() => { // store switched value
            bot.answerCallbackQuery({
                callback_query_id: query.id
            }).then((cb) => {
                getConfigKeyboard(groupId).then(kbd => { // update keyboard
                    bot.editMessageReplyMarkup(kbd, {
                        chat_id: query.message.chat.id,
                        message_id: query.message.message_id
                    })
                })
            })
        })
    })
})

// checks if message is message contains bot commands
let isCommand = function(msg){
    return msg.cfg && msg.cfg.deleteCommands && msg.entities.filter(x=>x.type == "bot_command").length > 0
}

// checks if message is 'user joined/left to jroup' 
let isJoinedMessage = function (msg) {
    return (msg.cfg && msg.cfg.joinedMsg) && (msg.new_chat_member !== undefined || msg.left_chat_member !== undefined)
}

// checks if message contains arabic symbols
let isArabicMessage = function (msg) {
    return (msg.cfg && msg.cfg.arabicMsg) && /[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF]/.test(msg.text) // testing on 'arabic' regex
}

// cheks if message contains url
let isUrlMessage = function (msg) {
    if (!(msg.cfg && msg.cfg.urlMsg)) {
        return false
    }

    if (msg.entities) {
        for (let e of msg.entities) {
            if (e.type == 'url') { // url messages have type 'url'
                return true
            }
        }
    }
    return false
}

let getConfigKeyboard = function (chatId) { // prepare config keyboard
    let getSetOfKeys = function (groupConfig) {
        return {
            inline_keyboard: [
                [{
                    text: `${groupConfig.joinedMsg ? "✔️" : "❌"} | delete 'joined' messages`,
                    callback_data: `${groupConfig.groupId}#joinedMsg`
                }], [{
                    text: `${groupConfig.arabicMsg ? "✔️" : "❌"} | delete arabic messages`,
                    callback_data: `${groupConfig.groupId}#arabicMsg`
                }], [{
                    text: `${groupConfig.urlMsg ? "✔️" : "❌"} | delete messages with urls`,
                    callback_data: `${groupConfig.groupId}#urlMsg`
                }], [{
                    text: `${groupConfig.deleteCommands ? "✔️" : "❌"} | delete messages with commands`,
                    callback_data: `${groupConfig.groupId}#deleteCommands`
                }]
            ]
        }
    }

    return new Promise(function (resolve, rej) {
        mongoGroups.findOne({ groupId: chatId }).then(res => {
            if (res == undefined || res.length == 0) {
                let g = new GroupConfig(chatId)
                mongoGroups.insertOne(g).then(() => { resolve(getSetOfKeys(g)) })

            } else {
                resolve(getSetOfKeys(res))
            }
        })
    })
}




class GroupConfig {
    constructor(id) {
        this.joinedMsg = false
        this.arabicMsg = false
        this.urlMsg = false
        this.deleteCommands = false
        this.groupId = id
    }
}
