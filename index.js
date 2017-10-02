// Import modules
const MongoClient = require('mongodb').MongoClient
const Mongo = require('mongodb')
const TelegramBot = require('node-telegram-bot-api')
const MongoCollections = require('./lib/MongoCollections')
const filterReducer = require('./lib/filters').filterReducer
const Command = require("./lib/commands")
const CommonFunctions = require("./lib/commonFunctions")
const token = process.env.BOT_TOKEN || require('./config').bot_token
const mongoConection = process.env.MONGO_CONNECTION || require('./config').mongo_connection

const actionTypes = {
    command: "COMMAND",
    deleteConfigMessage: "DELETE_CONFIG_MESSAGE",
    deleteFilteredMessage: "DELETE_FILTERED_MESAGE",
    groupConfiguratiuon: "GROUP_CONFIGURATION",
    configWithNotEnoughtRights: "TRYING_TO_CONFIGURE_GROUP_WITH_NOT_ENOUGHT_RIGHTS",
    tryingConfigureInPrivate: "SENDING_CONFIG_PM",
    tryingConfigureNormalGroup: "TRYING_TO_CONFIGURE_NORMAL_GROUP",
    setHello: "SET_HELLO_MESSAGE",
    expiredConfigSession: "CONFIG_SESSION_EXPIRED",
    start: "START_COMMAND",
    help: "HELP_COMMAND",
    hello: "HELLO_MESSAGE",
    keyboardCallback: "KEYBOARD_CALLBACK",
    restrictingSpammer: "RESTRICTING_SPAMMER",
    log: "VIEWING_LOG"
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

const bot = new TelegramBot(token, options)

const mongoCollections = new MongoCollections()

MongoClient.connect(mongoConection)
    .then(function (db) { // first - connect to database
        mongoCollections.mongoGroups = db.collection('groups')
        mongoCollections.mongoMessages = db.collection('messagesLog')
        mongoCollections.mongoNowConfigatates = db.collection('nowConfigurates')
        mongoCollections.mongoActionLog = db.collection('actionLog')
        mongoCollections.mongoWarns = db.collection('warns')

        mongoCollections.mongoMessages.createIndex({ postedDate: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 }) //store messages for 60 days
            .then(async () => {
                let url = process.env.APP_URL
                //me = await bot.getMe()
                if (url) {
                    console.log('hookin')
                    bot.setWebHook(`${url}/bot${token}`)
                } else {
                    console.log('pollin')
                    bot.startPolling()
                }

            })
    })
    .catch((e) => {
        console.log(`FATAL :: ${e}`)
    })

const command = new Command(log, actionTypes, bot, mongoCollections)
const commonFunctions = new CommonFunctions(bot)

subscribeToBotEvents();

//check if user sends messages too frequently
async function checkIfSpam(msg) {
    let entry = { postedDate: { $gte: commonFunctions.secondsAgo(30) }, "message.from.id": msg.from.id, "message.chat.id": msg.chat.id }
    let count = await mongoCollections.mongoMessages.count(entry)

    if (count > 10)
        restrictSpammer(msg)
}

function log(eventType, payload) {
    mongoCollections.mongoActionLog.insertOne({ actionDate: new Date(), eventType, payload })
}

function restrictSpammer(msg) {
    log(actionTypes.restrictingSpammer, msg)
    bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { })
}

//create and format hello message
function prepareHelloMessage(cfg, msg) {
    let message = ''
    const name = (msg.new_chat_participant.first_name || "" + ' ' + msg.new_chat_participant.last_name || '').trim() || msg.new_chat_participant.username
    message = cfg.helloMsgString || `Thanks for joining, *$name*.Please follow the guidelines of the group and enjoy your time`;
    return message.replace("$name", name)
}

async function kickByReply(msg) {
    let admins = await commonFunctions.getChatAdmins(msg.chat);
    if (commonFunctions.messageSenderIsAdmin(admins, msg) && !commonFunctions.messageSenderIsAdmin(admins, msg.reply_to_message)) {
        await bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id);
        bot.unbanChatMember(msg.chat.id, msg.reply_to_message.from.id);
    }
}

async function banByReply(msg) {
    let admins = await commonFunctions.getChatAdmins(msg.chat);
    if (commonFunctions.messageSenderIsAdmin(admins, msg) && !commonFunctions.messageSenderIsAdmin(admins, msg.reply_to_message)) {
        bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id);
    }
}

//check if message need to be deleted according on filters
async function tryFilterMessage(msg) {
    mongoCollections.mongoMessages.insertOne({ postedDate: new Date(), message: msg });
    let cfg = await mongoCollections.mongoGroups.findOne({ groupId: msg.chat.id }); // load group configuration
    if (cfg && cfg.helloMsg && msg.new_chat_member) {
        log(actionTypes.hello, msg);
        var helloMsg = prepareHelloMessage(cfg, msg);
        let messageOptions = { parse_mode: "markdown" };
        if (!cfg.joinedMsg) {
            messageOptions.reply_to_message_id = msg.message_id;
        }
        bot.sendMessage(msg.chat.id, helloMsg, messageOptions);
    }
    let admins = await commonFunctions.getChatAdmins(msg.chat); // get list of admins
    if (filterReducer(msg, cfg, admins)) {
        log(actionTypes.deleteFilteredMessage, msg);
        bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { });
    }
    if (!commonFunctions.messageSenderIsAdmin(admins, msg))
        if (cfg.restrictSpam)
            checkIfSpam(msg);
}

//prepair bot to interact with users
function subscribeToBotEvents() {
    bot.onText(/\/config/, async function (msg) {
        await command.configCommand(msg);
    });
    bot.onText(/^\/kick/, async (msg) => {
        await kickByReply(msg);
    });
    bot.onText(/\/ban/, async (msg) => {
        await banByReply(msg);
    });
    bot.onText(/\/warn/, async (msg) => {
        await command.warnCommand(msg);
    });
    bot.onText(/\/unwarn/, async (msg) => {
        await command.unwarnCommand(msg);
    });
    bot.onText(/^\/set_hello(\s(.*))?$/, async (msg, match) => {
        await command.setHelloCommand(msg, match);
    });
    // Bot reaction on commands "/start"
    bot.onText(/\/start/, function (msg) {
        command.startCommand(msg);
    });
    bot.onText(/\/log/, async function (msg) {
        await command.logCommand(msg);
    });
    // Bot reaction on commands "/help"
    bot.onText(/\/help/, function (msg) {
        command.helpCommand(msg);
    });
    // Bot reaction on any message
    bot.on('message', async (msg) => {
        if (msg.chat.type !== 'supergroup')
            return; //we can delete messages only from supergroups 
        await tryFilterMessage(msg);
    });
    // Buttons responce in menu
    bot.on('callback_query', async (query) => {
        await command.menuCallback(query);
    });
}

