// Checks if message is 'user joined/left to jroup' 
function isJoinedMessage(msg) {
  return (msg.hasOwnProperty('new_chat_member') 
  || msg.hasOwnProperty('left_chat_member'))
}

// Checks if message contains arabic symbols
function isArabicMessage(msg) {
  return /[\u0600-\u06FF]/.test(msg.text);
}

// Cheks if message contains url
function isUrlMessage(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'url') return true;
    }
  }
  return false

}

// Check if message is bot command
function isBotCommand(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'bot_command') return true;
    }
  }
  return false;

}

function isPinnedServiceMessage(msg) {
  return msg.hasOwnProperty('pinned_message')
}

// Return default cfg
function groupConfig(chatId) {
  return {
    joinedMsg: false,
    pinnedMsg: false,
    arabicMsg: false,
    urlMsg: false,
    deleteCommands: false,
    groupId: chatId,
    helloMsg: false
  }
}

module.exports.implementation = {
  groupConfig: groupConfig,
  isPinnedServiceMessage: isPinnedServiceMessage,
  isBotCommand: isBotCommand,
  isUrlMessage: isUrlMessage,
  isArabicMessage: isArabicMessage,
  isJoinedMessage, isJoinedMessage
}

// check every cfg param and if true - check message
module.exports.filterReducer = function filterReducer(msg, cfg) {
  return (
           cfg.joinedMsg && isJoinedMessage(msg) 
        || cfg.pinnedMsg && isPinnedServiceMessage(msg) 
        || cfg.arabic && isArabicMessage(msg) 
        || cfg.urlMsg && isUrlMessage(msg) 
        || cfg.deleteCommands && isBotCommand(msg)
      )
  
}
