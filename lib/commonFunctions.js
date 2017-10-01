const groupConfig = require('./filters').groupConfig

class CommonFuctions {
    constructor(bot) {
        this.bot = bot
    }

    /**
     * 
     * @param {*} chat 
     */
    async getChatAdmins(chat) {
        return await this.bot.getChatAdministrators(chat.id) // get list of admins
    }

    /**
     * 
     * @param {Array} admins 
     * @param {*} msg 
     */
    messageSenderIsAdmin(admins, msg) {
        return admins.filter(x => x.user.id == msg.from.id).length > 0
    }

    /**
     * 
     * @param {Number} secs 
     */
    secondsAgo(secs) {
        return new Date((new Date()).getTime() - secs * 1000);
    }

}

module.exports = CommonFuctions