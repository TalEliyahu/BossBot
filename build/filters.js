'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isJoinedMessage = isJoinedMessage;
exports.isArabicMessage = isArabicMessage;
exports.isUrlMessage = isUrlMessage;
exports.isBotCommand = isBotCommand;
exports.isPinnedServiceMessage = isPinnedServiceMessage;
exports.groupConfig = groupConfig;
exports.filterReducer = filterReducer;
// Checks if message is 'user joined/left to jroup' 
function isJoinedMessage(msg) {
  if (msg.hasOwnProperty('new_chat_member') || msg.hasOwnProperty('left_chat_member')) {
    return true;
  } else {
    return false;
  }
}

// Checks if message contains arabic symbols
function isArabicMessage(msg) {
  return (/[\u0600-\u06FF]/.test(msg.text)
  );
}

// Cheks if message contains url
function isUrlMessage(msg) {
  if (msg.entities) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = msg.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var e = _step.value;

        if (e.type === 'url') return true;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } else {
    return false;
  }
}

// Check if message is bot command
function isBotCommand(msg) {
  if (msg.entities) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = msg.entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var e = _step2.value;

        if (e.type === 'bot_command') return true;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  } else {
    return false;
  }
}

function isPinnedServiceMessage(msg) {
  if (msg.hasOwnProperty('pinned_message')) {
    return true;
  } else {
    return false;
  }
}

// Return default cfg
function groupConfig(chatId) {
  return {
    joinedMsg: false,
    pinnedMsg: false,
    arabicMsg: false,
    urlMsg: false,
    deleteCommands: false,
    groupId: chatId
  };
}

// check every cfg param and if true - check message
function filterReducer(msg, cfg) {
  if (cfg.joinedMsg && isJoinedMessage(msg) || cfg.pinnedMsg && isPinnedServiceMessage(msg) || cfg.arabic && isArabicMessage(msg) || cfg.urlMsg && isUrlMessage(msg) || cfg.deleteCommands && isBotCommand(msg)) return true;
  return false;
}