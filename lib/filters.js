// Checks if message is 'user joined/left to jroup'
function isJoinedMessage(msg) {
    return (msg.hasOwnProperty('new_chat_member')
    || msg.hasOwnProperty('left_chat_member'));
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
    return false;
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
    return msg.hasOwnProperty('pinned_message');
}

function isMessageLongerMaxLength(msg, maxLength) {
    return msg.text.length > maxLength;
}

// Return default cfg
module.exports.groupConfig = function groupConfig(chatId) {
    return {
        joinedMsg: false,
        pinnedMsg: false,
        arabicMsg: false,
        urlMsg: false,
        deleteCommands: false,
        groupId: chatId,
        helloMsg: false
    };
};

module.exports.implementation = {
    groupConfig: module.exports.groupConfig,
    isPinnedServiceMessage,
    isBotCommand,
    isUrlMessage,
    isArabicMessage,
    isJoinedMessage
};

/**
    * Check if message sender is current chat administrator
    * @param {Array} admins
    * @param {*} msg
    * @returns {boolean}
    */
function messageSenderIsAdmin(admins, msg) {
    return admins.filter(x => x.user.id === msg.from.id).length > 0;
}

// Checks that links im message not in whitelist
function isLinksNotInWhitelist(msg, cfg) {
    if (msg.entities) {
        for (let e of msg.entities) {
            if (e.type === 'url') {
                const { offset, length } = e;
                const url = msg.text.slice(offset, offset + length);

                if (!cfg.whiteList || !cfg.whiteList.includes(url)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// check every cfg param and if true - check message
module.exports.filterReducer = function filterReducer(msg, cfg, admins) {
    let result = false;

    result = cfg.joinedMsg && isJoinedMessage(msg)
    || cfg.deleteCommands && isBotCommand(msg)
    || cfg.pinnedMsg && isPinnedServiceMessage(msg);

    if (!messageSenderIsAdmin(admins, msg)) {
        result = result || cfg.arabicMsg && isArabicMessage(msg)
      || cfg.urlMsg && isLinksNotInWhitelist(msg, cfg)
      || cfg.maxMessageLength && isMessageLongerMaxLength(msg, cfg.maxMessageLength);
    }

    return result;
};
