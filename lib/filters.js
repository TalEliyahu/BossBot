// Checks if message is 'user joined/left to jroup' 
module.exports.isJoinedMessage = function isJoinedMessage(msg) {
  if (msg.hasOwnProperty('new_chat_member') || msg.hasOwnProperty('left_chat_member')) {
    return true;
  } else {
    return false;
  }
}

// Checks if message contains arabic symbols
module.exports.isArabicMessage = function isArabicMessage(msg) {
  return /[\u0600-\u06FF]/.test(msg.text);
}

// Cheks if message contains url
module.exports.isUrlMessage = function isUrlMessage(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'url') return true;
    }
  } else {
    return false
  }
}

// Check if message is bot command
module.exports.isBotCommand = function isBotCommand(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'bot_command') return true;
    }
  } else {
    return false;
  }
}

module.exports.isPinnedServiceMessage = function isPinnedServiceMessage(msg) {
  if (msg.hasOwnProperty('pinned_message')) {
    return true;
  } else {
    return false;
  }
}

// Return default cfg
module.exports.groupConfig = function groupConfig(chatId) {
  return {
    joinedMsg: false,
    pinnedMsg: false,
    arabicMsg: false,
    urlMsg: false,
    deleteCommands: false,
    groupId: chatId
  }
}

// check every cfg param and if true - check message
module.exports.filterReducer = function filterReducer(msg, cfg) {
  if ((cfg.joinedMsg && isJoinedMessage(msg)) || (cfg.pinnedMsg && isPinnedServiceMessage(msg)) || (cfg.arabic && isArabicMessage(msg)) || (cfg.urlMsg && isUrlMessage(msg)) || (cfg.deleteCommands && isBotCommand(msg))) return true;
  return false;
}
