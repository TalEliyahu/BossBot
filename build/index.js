'use strict';

var _mongodb = require('mongodb');

var _nodeTelegramBotApi = require('node-telegram-bot-api');

var _nodeTelegramBotApi2 = _interopRequireDefault(_nodeTelegramBotApi);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _filters = require('./filters.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } // Import modules

// Import

// Import filter functions


var mongoGroups = void 0,
    mongoMessages = void 0;

// Load databases and then start bot
_mongodb.MongoClient.connect(_config2.default.mongo_connection).then(function (db) {
  // first - connect to database
  mongoGroups = db.collection('groups');
  mongoMessages = db.collection('messages');
  mongoMessages.createIndex({ postedDate: 1 }, { expireAfterSeconds: 10 }).then(function () {
    bot.startPolling();
  });
}).catch(function (e) {
  console.log('FATAL :: ' + e);
});

// Bot reaction on commands "/config"
bot.onText(/\/config/, function (msg, match) {
  // request configuration keyboard to PM
  if (match && msg.chat.type === 'supergroup') {
    // match must be not null (?)
    bot.deleteMessage(msg.chat.id, msg.message_id); // remove message with /cmd in supergroups
    bot.getChatAdministrators(msg.chat.id) // get list of admins
    .then(function (admins) {
      if (admins.filter(function (x) {
        return x.user.id == msg.from.id;
      }).length > 0) {
        // if sender is admin
        getConfigKeyboard(msg.chat.id).then(function (kbd) {
          // prepare keyboard
          bot.sendMessage(msg.from.id, '*' + msg.chat.title + '*', { // and sent it
            parse_mode: "markdown",
            reply_markup: kbd
          });
        });
      }
    });
  } else if (msg.chat.type === 'private') {
    bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure");
  }
});

// Bot messages monitoring
bot.on('message', function (msg) {
  if (msg.chat.type !== 'supergroup') return; //we can delete messages only from supergroups 
  mongoGroups.findOne({ groupId: msg.chat.id }).then(function (cfg) {
    // load group configuration
    if ((0, _filters.filterReducer)(msg, cfg)) {
      bot.deleteMessage(msg.chat.id, msg.message_id);
    }
  });
  console.dir(msg); // debug output
});

// Buttons responce in menu
bot.on('callback_query', function (query) {
  var groupId = Number(query.data.split("#")[0]);
  var prop = query.data.split("#")[1]; // get info from button
  mongoGroups.findOne({ groupId: groupId }).then(function (g) {
    var val = !g[prop]; // switch selected button
    mongoGroups.updateOne({ groupId: groupId }, { $set: _defineProperty({}, prop, val) }).then(function () {
      bot.answerCallbackQuery({ callback_query_id: query.id }) // store switched value
      .then(function (cb) {
        getConfigKeyboard(groupId).then(function (kbd) {
          // update keyboard
          bot.editMessageReplyMarkup(kbd, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
          });
        });
      });
    });
  });
});

function getConfigKeyboard(chatId) {
  // prepare config keyboard		
  return new Promise(function (resolve, rej) {
    mongoGroups.findOne({ groupId: chatId }).then(function (res) {
      if (res === undefined || res.length === 0) {
        var g = (0, _filters.groupConfig)(chatId);
        mongoGroups.insertOne(g).then(function () {
          resolve(getSetOfKeys(g));
        });
      } else {
        resolve(getSetOfKeys(res));
      }
    });
  });
}

// Return keyboard preset
function getSetOfKeys(groupConfig) {
  return {
    inline_keyboard: [[{
      text: (groupConfig.joinedMsg ? "✔️" : "❌") + ' | delete \'joined\' messages',
      callback_data: groupConfig.groupId + '#joinedMsg'
    }], [{
      text: (groupConfig.pinnedMsg ? "✔️" : "❌") + ' | delete \'pinned\' messages',
      callback_data: groupConfig.groupId + '#pinnedMsg'
    }], [{
      text: (groupConfig.arabicMsg ? "✔️" : "❌") + ' | delete arabic messages',
      callback_data: groupConfig.groupId + '#arabicMsg'
    }], [{
      text: (groupConfig.urlMsg ? "✔️" : "❌") + ' | delete messages with urls',
      callback_data: groupConfig.groupId + '#urlMsg'
    }], [{
      text: (groupConfig.deleteCommands ? "✔️" : "❌") + ' | delete messages with commands',
      callback_data: groupConfig.groupId + '#deleteCommands'
    }]]
  };
}