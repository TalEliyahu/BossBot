// Import modules
const MongoClient = require('mongodb').MongoClient;
const TelegramBot = require('node-telegram-bot-api');
// Import
//const config = require('./config');
// Import filter functions
const groupConfig = require('./lib/filters').groupConfig;
const filterReducer = require('./lib/filters').filterReducer;

let mongoGroups, mongoMessages;
const token = process.env.BOT_TOKEN || require('./config').bot_token
const mongoConection = process.env.MONGO_CONNECTION || require('./config').mongo_connection
const bot = new TelegramBot(token, { polling: { autoStart: false } }) //

// Load databases and then start bot
MongoClient.connect(config.mongo_connection)
    .then(function (db) { // first - connect to database
        mongoGroups = db.collection('groups');
        mongoMessages = db.collection('messages');
        mongoMessages.createIndex({ postedDate: 1 }, { expireAfterSeconds: 10 })
            .then(() => {
                let url = process.env.APP_URL
                if (url) {
                    bot.setWebHook(`${url}/bot${token}`)
                } else {
                    bot.startPolling()
                }
            })
    })
    .catch((e) => {
        console.log(`FATAL :: ${e}`);
    });

// Bot reaction on commands "/config"
bot.onText(/\/config/, async function (msg, match) { // request configuration keyboard to PM
    if (match && msg.chat.type === 'supergroup') { // match must be not null (?)
        bot.deleteMessage(msg.chat.id, msg.message_id); // remove message with /cmd in supergroups
        let admins = await bot.getChatAdministrators(msg.chat.id) // get list of admins

        if (admins.filter(x => x.user.id == msg.from.id).length > 0) { // if sender is admin
            let kbd = await getConfigKeyboard(msg.chat.id) // prepare keyboard

            bot.sendMessage(msg.from.id, `*${msg.chat.title}*`, { // and sent it
                parse_mode: "markdown",
                reply_markup: kbd
            });
        }

    } else if (msg.chat.type === 'private') {
        bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure");
    }
});



// Bot messages monitoring
bot.on('message', async (msg) => {
    if (msg.chat.type !== 'supergroup') return; //we can delete messages only from supergroups 
    let cfg = await mongoGroups.findOne({ groupId: msg.chat.id }) // load group configuration
    mongoMessages.insertOne(messageEntry(msg.from.id, msg.chat.id))
    if (filterReducer(msg, cfg)) {
        bot.deleteMessage(msg.chat.id, msg.message_id)
    } else { //spam
        if (cfg.restrictSpam)
            await checkIfSpam(msg)
    }

    console.dir(msg) // debug output
})



// Buttons responce in menu
bot.on('callback_query', async query => {
    let groupId = Number(query.data.split("#")[0])
    let prop = query.data.split("#")[1] // get info from button
    let g = await mongoGroups.findOne({ groupId: groupId })

    let val = !g[prop] // switch selected button
    await mongoGroups.updateOne({ groupId: groupId }, { $set: { [prop]: val } })

    let cb = await bot.answerCallbackQuery({ callback_query_id: query.id }) // store switched value

    let kbd = await getConfigKeyboard(groupId)// update keyboard

    bot.editMessageReplyMarkup(kbd, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
    })
})

async function checkIfSpam(msg) {

    let entry = messageEntry(msg.from.id, msg.chat.id, { $gte: new Date((new Date()).getTime() - 10 * 1000) })
    let count = await mongoMessages.count(entry)

    if (count > 5)
        restrictSpammer(msg)
}

async function getConfigKeyboard(chatId) { // prepare config keyboard		

    let res = await mongoGroups.findOne({ groupId: chatId })

    if (res === undefined || res.length === 0) {
        let g = groupConfig(chatId)
        await mongoGroups.insertOne(g)
        return getSetOfKeys(g)
    } else {
        return getSetOfKeys(res)
    }


}

// Return keyboard preset
function getSetOfKeys(groupConfig) {
    return {
        inline_keyboard: [
            [{
                text: `${groupConfig.joinedMsg ? "✔️" : "❌"} | delete 'joined' messages`,
                callback_data: `${groupConfig.groupId}#joinedMsg`
            }], [{
                text: `${groupConfig.pinnedMsg ? "✔️" : "❌"} | delete 'pinned' messages`,
                callback_data: `${groupConfig.groupId}#pinnedMsg`
            }], [{
                text: `${groupConfig.arabicMsg ? "✔️" : "❌"} | delete arabic messages`,
                callback_data: `${groupConfig.groupId}#arabicMsg`
            }], [{
                text: `${groupConfig.urlMsg ? "✔️" : "❌"} | delete messages with urls`,
                callback_data: `${groupConfig.groupId}#urlMsg`
            }], [{
                text: `${groupConfig.deleteCommands ? "✔️" : "❌"} | delete messages with commands`,
                callback_data: `${groupConfig.groupId}#deleteCommands`
            }], [{
                text: `${groupConfig.restrictSpam ? "✔️" : "❌"} | restrict spam`,
                callback_data: `${groupConfig.groupId}#restrictSpam`
            }]
        ]
    }
}

function restrictSpammer(msg) {
    bot.deleteMessage(msg.chat.id, msg.message_id)
}

function messageEntry(userid, groupId, date) {
    return {
        postedDate: date || new Date(),
        userId: userid,
        groupId: groupId
    }
}
