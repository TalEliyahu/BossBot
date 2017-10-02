const groupConfig = require('./filters').groupConfig
const TelegramBot = require('node-telegram-bot-api')

class CommonFuctions {
    /**
     * @param {TelegramBot} bot 
     */
    constructor(bot) {
        this.bot = bot
    }

    /**
     * Return chat administrator list
     * @param {*} chat 
     * @returns {Array<any>}
     */
    async getChatAdmins(chat) {
        return await this.bot.getChatAdministrators(chat.id)
    }

    /**
     * Check if message sender is current chat administrator
     * @param {Array} admins 
     * @param {*} msg 
     * @returns {boolean}
     */
    messageSenderIsAdmin(admins, msg) {
        return admins.filter(x => x.user.id == msg.from.id).length > 0
    }

    /**
     * Returns date secs seconds ago
     * @param {Number} secs 
     * @returns {Date}
     */
    secondsAgo(secs) {
        return new Date((new Date()).getTime() - secs * 1000);
    }

}

module.exports = CommonFuctions