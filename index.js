// Import modules
const MongoClient = require('mongodb').MongoClient
const TelegramBot = require('node-telegram-bot-api')
// Import
//const config = require('./config')
// Import filter functions
const groupConfig = require('./lib/filters').groupConfig
const filterReducer = require('./lib/filters').filterReducer

let mongoGroups, mongoMessages, mongoNowConfigatates

const token = process.env.BOT_TOKEN || require('./config').bot_token
const mongoConection = process.env.MONGO_CONNECTION || require('./config').mongo_connection

const switcher = function (x) {
    if (x) return "✔️"
    return "❌"
}

let options = {}
if (process.env.APP_URL) {
    console.log("using webhooks, " + process.env.APP_URL)
    options = {
        webHook: {
            port: process.env.PORT
        }
    }
}
else {
    console.log("using longpoll")
    options = {
        polling: {
            autoStart: false
        }
    }
}

const bot = new TelegramBot(token, options) //
let me = {}
// Load databases and then start bot
MongoClient.connect(mongoConection)
    .then(function (db) { // first - connect to database
        mongoGroups = db.collection('groups')
        mongoMessages = db.collection('messages')
        mongoNowConfigatates = db.collection('nowConfigurates')
        mongoMessages.dropIndex('postedDate_1').then(() => {
            mongoMessages.createIndex({ postedDate: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 }) //store messages for 60 days
                .then(async () => {
                    let url = process.env.APP_URL
                    me = await bot.getMe()
                    if (url) {
                        console.log('hookin')
                        bot.setWebHook(`${url}/bot${token}`)
                    } else {
                        console.log('pollin')
                        bot.startPolling()
                    }
                })
        })
    })
    .catch((e) => {
        console.log(`FATAL :: ${e}`)
    })

// Bot reaction on commands "/config"
bot.onText(/\/config/, async function (msg, match) { // request configuration keyboard to PM
    if (msg.chat.type === 'supergroup') {

        bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { }) // remove message with /cmd in supergroups

        let admins = await getChatAdmins(msg.chat) // get list of admins

        if (messageSenderIsAdmin(admins, msg)) {
            mongoNowConfigatates.updateOne({ user: msg.from.id }, { $set: { group: msg.chat, date: new Date() } }, { upsert: true })

            let alertMsg = ""
            let myAdminRights = admins.filter(x => x.user.id == me.id)[0]
            let enoughtRights = myAdminRights && myAdminRights.can_delete_messages && myAdminRights.can_restrict_members

            if (!enoughtRights) {
                alertMsg = "_Bot have not enougth rights in this group! Promote him to admin, grant 'delete messages' and 'ban users' rights!_"
                bot.sendMessage(msg.from.id, `${alertMsg}`, {
                    parse_mode: "markdown",
                })
            } else {
                let kbd = await getConfigKeyboard(msg.chat.id) // prepare keyboard
                bot.sendMessage(msg.from.id, `*${msg.chat.title}* configuration`, {
                    parse_mode: "markdown",
                    reply_markup: kbd
                })
            }
        }
    } else if (msg.chat.type === 'private') {
        bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure").catch(() => { })
    } else if (msg.chat.type === 'group') {
        bot.sendMessage(msg.from.id, "Normal groups are not supported yet. Upgrade this group to supergroup first!").catch(() => { })
    }
})

bot.onText(/^\/set_hello(\s(.*))?$/, async (msg, match) => {
    if (msg.chat.type === 'private') {

        const message = match[2]

        const currentlyEdit = await mongoNowConfigatates.findOne({ user: msg.from.id, date: { $gte: secondsAgo(600) } }).catch(e => console.dir)
        const group = currentlyEdit && currentlyEdit.group
        console.dir(group)
        if (group) {
            mongoGroups.updateOne({ groupId: group.id }, { $set: { helloMsgString: message } })
            if (message)
                bot.sendMessage(msg.chat.id, `_Hello message for group_ *${group.title}* _set to:_\n${message}`, { parse_mode: "markdown" })
            else
                bot.sendMessage(msg.chat.id, `_You set hello message to default value. To disable it please switch button on config keyboard_`, { parse_mode: "markdown" })
        }
        else
            bot.sendMessage(msg.chat.id, `You are currently no editing any groups. Send \`/config\` to group chat to start configure this group.`, { parse_mode: "markdown" })
    }
})

// Bot reaction on commands "/start"
bot.onText(/\/start/, function (msg) {
    bot.sendMessage(msg.from.id, "Well done! You can use /help command to get some documentation.")
})

// Bot reaction on commands "/help"
bot.onText(/\/help/, function (msg) {
    const text = `*IMPORTANT*
This bot can work only in supergroups for now!

To configure bot in your group you need:
    1) Invite bot to your group.
    2) Promote him to admin (enable "Delete messages" and "Ban users").
    3) Configure bot by sending /config right into your group (message will disappear immediately).

*Why should you send a message to the group but not private?*
This is telegram limitation. In situation when you have couple of groups and want to configure one, bot cannot know which group you want to configure. So you need explicitly point it. Message will appear for moment, it wont interrupt chat members discussion.

*Available commands:*
/help
Show this message

/set\\_hello %your message%
Sets hello message for new chat members. You can use \`$name\` placeholder, it will be replaced with new participiant name. 
Call command without message to set default one. Make sure "Hello message for new members" switch are enabled.
`

    bot.sendMessage(msg.from.id, text, {
        parse_mode: "markdown"
    })
})

// Bot reaction on any message
bot.on('message', async (msg) => {
    if (msg.chat.type !== 'supergroup') return //we can delete messages only from supergroups 

    let cfg = await mongoGroups.findOne({ groupId: msg.chat.id }) // load group configuration

    if (cfg && cfg.helloMsg && msg.new_chat_member) { // print hello message if enabled
        var helloMsg = prepareHelloMessage(cfg, msg)
        let messageOptions = { parse_mode: "markdown" }

        if (!cfg.joinedMsg) { // reply to service 'joined' mesasge if there is no enabled option to delete those messages
            messageOptions.reply_to_message_id = msg.message_id
        }

        bot.sendMessage(msg.chat.id, helloMsg, messageOptions)
    }

    mongoMessages.insertOne(messageEntry(msg.from.id, msg.chat.id))

    let admins = await getChatAdmins(msg.chat) // get list of admins

    if (!messageSenderIsAdmin(admins, msg)) { // check message legitimacy only if sender is not group admin
        if (filterReducer(msg, cfg)) { // check filters for message
            bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { })
        } else { // check if spam
            if (cfg.restrictSpam) // check antispam is enabled in config
                checkIfSpam(msg)
        }
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
    let entry = messageEntry(msg.from.id, msg.chat.id, { $gte: secondsAgo(10) })
    let count = await mongoMessages.count(entry)

    if (count > 5)
        restrictSpammer(msg)
}

async function getConfigKeyboard(chatId) { // prepare config keyboard		
    let res = await mongoGroups.findOne({ groupId: chatId })
    if (!res || res.length === 0) {
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
                text: `${switcher(groupConfig.joinedMsg)} | delete 'joined' messages`,
                callback_data: `${groupConfig.groupId}#joinedMsg`
            }], [{
                text: `${switcher(groupConfig.pinnedMsg)} | delete 'pinned' messages`,
                callback_data: `${groupConfig.groupId}#pinnedMsg`
            }], [{
                text: `${switcher(groupConfig.arabicMsg)} | delete arabic messages`,
                callback_data: `${groupConfig.groupId}#arabicMsg`
            }], [{
                text: `${switcher(groupConfig.urlMsg)} | delete messages with urls`,
                callback_data: `${groupConfig.groupId}#urlMsg`
            }], [{
                text: `${switcher(groupConfig.deleteCommands)} | delete messages with commands`,
                callback_data: `${groupConfig.groupId}#deleteCommands`
            }], [{
                text: `${switcher(groupConfig.restrictSpam)} | restrict spam`,
                callback_data: `${groupConfig.groupId}#restrictSpam`
            }], [{
                text: `${switcher(groupConfig.helloMsg)} | hello message for new members`,
                callback_data: `${groupConfig.groupId}#helloMsg`
            }]
        ]
    }
}

function restrictSpammer(msg) {
    bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { })
}

function messageEntry(userid, groupId, date) {
    return {
        postedDate: date || new Date(),
        userId: userid,
        groupId: groupId
    }
}
async function getChatAdmins(chat) {
    return await bot.getChatAdministrators(chat.id) // get list of admins
}

function messageSenderIsAdmin(admins, msg) {
    return admins.filter(x => x.user.id == msg.from.id).length > 0;
}
function secondsAgo(secs) {
    return new Date((new Date()).getTime() - secs * 1000);
}

function prepareHelloMessage(cfg, msg) {
    let message = ''
    const name = (msg.new_chat_participant.first_name || '' + msg.new_chat_participant.last_name || '').trim() || msg.new_chat_participant.username
    message = cfg.helloMsgString || `Thanks for joining, *$name*.Please follow the guidelines of the group and enjoy your time`;
    return message.replace("$name", name)
}

