// Checks if message is 'user joined/left to jroup' 
export function isJoinedMessage(msg) {
  if (msg.hasOwnProperty('new_chat_member') || msg.hasOwnProperty('left_chat_member')) {
    return true;
  } else {
    return false;
  }
}

// Checks if message contains arabic symbols
export function isArabicMessage(msg) {
  return /[\u0600-\u06FF]/.test(msg.text);
}

// Cheks if message contains url
export function isUrlMessage(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'url') return true;
    }
  } else {
    return false
  }
}

// Check if message is bot command
export function isBotCommand(msg) {
  if (msg.entities) {
    for (let e of msg.entities) {
      if (e.type === 'bot_command') return true;
    }
  } else {
    return false;
  }
}
