// Import modules
const MongoClient = require('mongodb').MongoClient;
const TelegramBot = require('node-telegram-bot-api');
// Import
const config = require('./config');
// Import filter functions
const groupConfig = require('./lib/filters').groupConfig;
const filterReducer = require('./lib/filters').filterReducer;

let mongoGroups, mongoMessages;
const bot = new TelegramBot(config.bot_token, { polling: { autoStart: false } }) //

// Load databases and then start bot
MongoClient.connect(config.mongo_connection)
  .then(function (db) { // first - connect to database
    mongoGroups = db.collection('groups');
    mongoMessages = db.collection('messages');
    mongoMessages.createIndex({ postedDate: 1 }, { expireAfterSeconds: 10 })
      .then(() => {
        bot.startPolling();
      })
  })
  .catch((e) => {
    console.log(`FATAL :: ${e}`);
  });



// Bot reaction on commands "/config"
bot.onText(/\/config/, function (msg, match) { // request configuration keyboard to PM
  if (match && msg.chat.type === 'supergroup') { // match must be not null (?)
    bot.deleteMessage(msg.chat.id, msg.message_id); // remove message with /cmd in supergroups
    bot.getChatAdministrators(msg.chat.id) // get list of admins
      .then((admins) => {
        if (admins.filter(x => x.user.id == msg.from.id).length > 0) { // if sender is admin
          getConfigKeyboard(msg.chat.id)
            .then((kbd) => { // prepare keyboard
              bot.sendMessage(msg.from.id, `*${msg.chat.title}*`, { // and sent it
                parse_mode: "markdown",
                reply_markup: kbd
              });
            })
        }
      })
  } else if (msg.chat.type === 'private') {
    bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure");
  }
});



// Bot messages monitoring
bot.on('message', (msg) => {
  if (msg.chat.type !== 'supergroup') return; //we can delete messages only from supergroups 
  mongoGroups.findOne({ groupId: msg.chat.id })
    .then((cfg) => { // load group configuration
      if (filterReducer(msg, cfg)) {
        bot.deleteMessage(msg.chat.id, msg.message_id)
      }
    })
  console.dir(msg) // debug output
})



// Buttons responce in menu
bot.on('callback_query', query => {
  let groupId = Number(query.data.split("#")[0])
  let prop = query.data.split("#")[1] // get info from button
  mongoGroups.findOne({ groupId: groupId })
    .then((g) => {
      let val = !g[prop] // switch selected button
      mongoGroups.updateOne({ groupId: groupId }, { $set: { [prop]: val } })
        .then(() => {
          bot.answerCallbackQuery({ callback_query_id: query.id }) // store switched value
            .then((cb) => {
              getConfigKeyboard(groupId)
                .then(kbd => { // update keyboard
                  bot.editMessageReplyMarkup(kbd, {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id
                  })
                })
            })
        })
     })
})




function getConfigKeyboard(chatId) { // prepare config keyboard		
  return new Promise(function (resolve, rej) {
    mongoGroups.findOne({ groupId: chatId })
      .then((res) => {
        if (res === undefined || res.length === 0) {
          let g = groupConfig(chatId)
          mongoGroups.insertOne(g)
            .then(() => { resolve(getSetOfKeys(g)) })
        } else {
          resolve(getSetOfKeys(res))
        }
      })
  })
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

