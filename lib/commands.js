const CommonFunctions = require("./commonFunctions")
const TelegramBot = require('node-telegram-bot-api')
const MongoCollections = require('./MongoCollections')
const MongoCollection = require('mongodb/lib/collection')

function parseArgsFromString(argsString) {
    return (argsString|| '')
        .trim()
        .split(' ')
        .filter(l => l !== '');
}

class Commands {
    /**
     * @param  {Function} log 
     * @param  {Object} actionTypes 
     * @param  {TelegramBot} bot 
     * @param {MongoCollections} mongoCollections
     * @return {Commands}
   */
    constructor(log, actionTypes, bot, mongoCollections) {
        this.log = log
        this.bot = bot
        this.actionTypes = actionTypes
        this.commonFunctions = new CommonFunctions(this.bot)
        this.collections = mongoCollections
        this.init()
    }

    init() {
        this.bot.getMe().then(x => this.me = x)
    }

    switcher(x) {
        if (x) return "✔️"
        return "❌"
    }

    async configCommand(msg) {
        this.log(this.actionTypes.command, msg);
        if (msg.chat.type === 'supergroup') {
            this.bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { }); // remove message with /cmd in supergroups
            let admins = await this.commonFunctions.getChatAdmins(msg.chat); // get list of admins
            if (this.commonFunctions.messageSenderIsAdmin(admins, msg)) {
                this.collections.mongoNowConfigatates.updateOne({ user: msg.from.id }, { $set: { group: msg.chat, date: new Date() } }, { upsert: true });
                let alertMsg = "";
                let myAdminRights = admins.filter(x => x.user.id == this.me.id)[0];

                let enoughtRights = myAdminRights && myAdminRights.can_delete_messages && myAdminRights.can_restrict_members;
                if (!enoughtRights) {
                    this.log(this.actionTypes.configWithNotEnoughtRights, msg);
                    alertMsg = "_Bot have not enougth rights in this group! Promote him to admin, grant 'delete messages' and 'ban users' rights!_";
                    this.bot.sendMessage(msg.from.id, `${alertMsg}`, {
                        parse_mode: "markdown",
                    });
                }
                else {
                    this.log(this.actionTypes.groupConfiguratiuon, msg);
                    let kbd = await this.getConfigKeyboard(msg.chat.id); // prepare keyboard
                    this.bot.sendMessage(msg.from.id, `* ${msg.chat.title}* configuration`, {
                        parse_mode: "markdown",
                        reply_markup: kbd
                    });
                }
            }
        }
        else if (msg.chat.type === 'private') {
            this.log(this.actionTypes.tryingConfigureInPrivate, msg);
            this.bot.sendMessage(msg.chat.id, "You sould use this command in supergroups that you want to configure").catch(() => { });
        }
        else if (msg.chat.type === 'group') {
            this.log(this.actionTypes.tryingConfigureNormalGroup, msg);
            this.bot.sendMessage(msg.from.id, "Normal groups are not supported yet. Upgrade this group to supergroup first!").catch(() => { });
        }
    }

    async warnCommand(msg) {
        const maxWarn = 3;
        let admins = await this.commonFunctions.getChatAdmins(msg.chat);
        if (this.commonFunctions.messageSenderIsAdmin(admins, msg) && !this.commonFunctions.messageSenderIsAdmin(admins, msg.reply_to_message)) {
            await this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $inc: { warn: 1 } }, { upsert: true });
            let warns = (await this.collections.mongoWarns.findOne({ user: msg.reply_to_message.from.id, group: msg.chat.id })).warn;
            this.bot.sendMessage(msg.chat.id, `${msg.reply_to_message.from.first_name} has been warned by admin. *${warns}/${maxWarn}*`, { parse_mode: "markdown" })            
            if (warns >= maxWarn) {
                this.bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id).then(
                    () => this.bot.unbanChatMember(msg.chat.id, msg.reply_to_message.from.id)
                )
                this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $set: { warn: 0 } });
            }
        }
    }

    async unwarnCommand(msg) {
        const maxWarn = 3;
        let admins = await this.commonFunctions.getChatAdmins(msg.chat);
        if (this.commonFunctions.messageSenderIsAdmin(admins, msg)) {
            this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $set: { warn: 0 } });
        }
    }

    helpCommand(msg) {
        this.log(this.actionTypes.help, msg);
        const text = `*IMPORTANT*
    This bot can work only in supergroups for now!
    
    To configure bot in your group you need:
        1) Invite bot to your group.
        2) Promote him to admin (enable "Delete messages" and "Ban users").
        3) Configure bot by sending /config right into your group (message will disappear immediately).
    
    *Why should you send a message to the group but not private?*
    This is telegram limitation. In situation when you have couple of groups and want to configure one, bot cannot know which group you want to configure. So you need explicitly point it. Message will appear for moment, it wont interrupt chat members discussion.
    
    *Available commands:*
    /help
    Show this message
    
    /set\\_hello %your message%
    Sets hello message for new chat members. You can use \`$name\` placeholder, it will be replaced with new participiant name. 
    Call command without message to set default one. Make sure "Hello message for new members" switch are enabled.
    `;
        this.bot.sendMessage(msg.from.id, text, {
            parse_mode: "markdown"
        });
    }

    async whiteList(msg, linksString) {
        const { mongoWhiteList } = this.collections;
        const links = parseArgsFromString(linksString);

        mongoWhiteList
            .find({})
            .toArray(async (err, docs) => {
                if (err) {
                    console.log(err);
                    return;
                }

                const currentLinks = docs.map(d => d.link);

                if (links.length === 0) {
                    console.log('showing currentLinks');
                    this.bot.sendMessage(msg.from.id, currentLinks.join('\n') || 'Whitelist is empty');
                } else {
                    console.log('adding links');
                    const promises = links
                        .filter(link => !currentLinks.includes(link))
                        // Change to set insert after models refactoring
                        .map(link => mongoWhiteList.insertOne({ link }));

                    await Promise.all(promises);

                    const message = links.map(l =>
                        currentLinks.includes(l)
                        ? `Already in whitelist: ${l}`
                        : `Added: ${l}`
                    ).join('\n');

                    this.bot.sendMessage(msg.from.id, message);
                }
            })
    }

    async unWhiteList(msg, linksString) {
        const { mongoWhiteList } = this.collections;
        const links = parseArgsFromString(linksString);
        mongoWhiteList
            .find({})
            .toArray(async (err, docs) => {
                if (err) {
                    console.log(err);
                    return;
                }

                const currentLinks = docs.map(d => d.link);

                if (links.length === 1 && links[0] === '-') {
                    await mongoWhiteList.deleteMany({});
                    this.bot.sendMessage(msg.from.id, 'Whitelist is cleared');
                } else if (links.length > 0) {
                    const promises = links.map(link => mongoWhiteList.deleteOne({ link }));
                    const message = links.map(l =>
                        currentLinks.includes(l)
                            ? `Not in whitelist: ${l}`
                            : `Deleted: ${l}`
                    ).join('\n');

                    await Promise.all(promises);
                    this.bot.sendMessage(msg.from.id, message);
                }
            });
    }

    async menuCallback(query) {
        this.log(this.actionTypes.keyboardCallback, query);
        let groupId = Number(query.data.split("#")[0]);
        let prop = query.data.split("#")[1]; // get info from button
        let g = await this.collections.mongoGroups.findOne({ groupId: groupId });
        let val = !g[prop]; // switch selected button
        await this.collections.mongoGroups.updateOne({ groupId: groupId }, { $set: { [prop]: val } });
        let cb = await this.bot.answerCallbackQuery({ callback_query_id: query.id }); // store switched value
        let kbd = await this.getConfigKeyboard(groupId); // update keyboard
        this.bot.editMessageReplyMarkup(kbd, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        });
    }
    startCommand(msg) {
        this.log(this.actionTypes.start, msg);
        this.bot.sendMessage(msg.from.id, "Well done! You can use /help command to get some documentation.");
    }
    async setHelloCommand(msg, match) {
        if (msg.chat.type === 'private') {
            const message = match[2];
            const currentlyEdit = await this.getGroupThatUserCurrentlyConfigures(msg);
            const group = currentlyEdit && currentlyEdit.group;
            if (group) {
                this.log(this.actionTypes.setHello, msg);
                this.collections.mongoGroups.updateOne({ groupId: group.id }, { $set: { helloMsgString: message } });
                if (message)
                    this.bot.sendMessage(msg.chat.id, `_Hello message for group_ *${group.title}* _set to: _\n${message}`, { parse_mode: "markdown" });
                else
                    this.bot.sendMessage(msg.chat.id, `_You set hello message to default value.To disable it please switch button on config keyboard_`, { parse_mode: "markdown" });
            }
            else {
                this.log(actionTypes.expiredConfigSession, msg);
                this.bot.sendMessage(msg.chat.id, `You are currently no editing any groups.Send \`/config\` to group chat to start configure this group.`, { parse_mode: "markdown" });
            }
        }
    }
    async logCommand(msg) {
        const currentlyEdit = await this.getGroupThatUserCurrentlyConfigures(msg);
        const group = currentlyEdit && currentlyEdit.group;
        if (!group) {
            this.log(actionTypes.expiredConfigSession, msg);
            this.bot.sendMessage(msg.from.id, `You are currently no editing any groups. Send \`/config\` to group chat to start configure this group.`, { parse_mode: "markdown" });
        }
        this.log(actionTypes.log, msg);
        this.collections.mongoActionLog.find({ actionDate: { $gte: secondsAgo(60 * 60 * 48) }, "payload.chat.id": group.id }).toArray((e, docs) => {
            if (e) {
                console.log(e);
                return;
            }
            const message = docs.map(x => `${x.eventType}:: ${x.payload.from.first_name || x.payload.from.username}:: ${x.payload.text}`).join('\n');
            this.bot.sendMessage(msg.from.id, message);
        });
    }

    async getConfigKeyboard(chatId) { // prepare config keyboard		
        let res = await this.collections.mongoGroups.findOne({ groupId: chatId })
        if (!res || res.length === 0) {
            let g = groupConfig(chatId)
            await this.collections.mongoGroups.insertOne(g)
            return this.getSetOfKeys(g)
        } else {
            return this.getSetOfKeys(res)
        }
    }

    // Return keyboard preset
    getSetOfKeys(groupConfig) {
        return {
            inline_keyboard: [
                [{
                    text: `${this.switcher(groupConfig.joinedMsg)} | delete 'joined' messages`,
                    callback_data: `${groupConfig.groupId}#joinedMsg`
                }], [{
                    text: `${this.switcher(groupConfig.pinnedMsg)} | delete 'pinned' messages`,
                    callback_data: `${groupConfig.groupId}#pinnedMsg`
                }], [{
                    text: `${this.switcher(groupConfig.arabicMsg)} | delete arabic messages`,
                    callback_data: `${groupConfig.groupId}#arabicMsg`
                }], [{
                    text: `${this.switcher(groupConfig.urlMsg)} | delete messages with urls`,
                    callback_data: `${groupConfig.groupId}#urlMsg`
                }], [{
                    text: `${this.switcher(groupConfig.deleteCommands)} | delete messages with commands`,
                    callback_data: `${groupConfig.groupId}#deleteCommands`
                }], [{
                    text: `${this.switcher(groupConfig.restrictSpam)} | restrict spam`,
                    callback_data: `${groupConfig.groupId}#restrictSpam`
                }], [{
                    text: `${this.switcher(groupConfig.helloMsg)} | hello message for new members`,
                    callback_data: `${groupConfig.groupId}#helloMsg`
                }]
            ]
        }
    }

    async getGroupThatUserCurrentlyConfigures(msg) {
        return await this.collections.mongoNowConfigatates.findOne({ user: msg.from.id, date: { $gte: this.commonFunctions.secondsAgo(600) } }).catch(e => console.dir);
    }
}

module.exports = Commands
