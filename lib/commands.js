const CommonFunctions = require('./commonFunctions');
const botMessages = require('../constants/botMessages');
const groupConfig = require('./filters').groupConfig;

const parseModeMarkdownObj = { parse_mode: 'markdown' };

function parseLinksFromMessage(msg) {
    return msg.entities.reduce((acc, e) => {
        if (e.type === 'url') {
            const { offset, length } = e;
            const url = msg.text.slice(offset, offset + length);
            const prefix = ['https://', 'http://', 'www.'].filter(prefix => url.startsWith(prefix))[0];
            const urlWithoutPrefix = prefix ? url.slice(prefix.length) : url;

            return acc.concat([urlWithoutPrefix]);
        }

        return acc;
    }, []);
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
        this.log = log;
        this.bot = bot;
        this.actionTypes = actionTypes;
        this.commonFunctions = new CommonFunctions(this.bot);
        this.collections = mongoCollections;
        this.init();
    }

    init() {
        this.bot.getMe().then(x => this.me = x);
    }

    switcher(x) {
        if (x) return '✔️';
        return '❌';
    }

    sendExpireMessage(msg, id) {
        this.log(this.actionTypes.expiredConfigSession, msg);
        this.bot.sendMessage(id, botMessages.askToSendConfig, parseModeMarkdownObj);
    }

    async configCommand(msg) {
        this.log(this.actionTypes.command, msg);
        if (msg.chat.type === 'supergroup') {
            this.bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => { }); // remove message with /cmd in supergroups
            let admins = await this.commonFunctions.getChatAdmins(msg.chat); // get list of admins
            if (this.commonFunctions.messageSenderIsAdmin(admins, msg)) {
                this.collections.mongoNowConfigatates.updateOne({ user: msg.from.id }, { $set: { group: msg.chat, date: new Date() } }, { upsert: true });
                let myAdminRights = admins.filter(x => x.user.id == this.me.id)[0];

                let enoughtRights = myAdminRights && myAdminRights.can_delete_messages && myAdminRights.can_restrict_members;
                if (!enoughtRights) {
                    this.log(this.actionTypes.configWithNotEnoughtRights, msg);
                    this.bot.sendMessage(msg.from.id, botMessages.botHaveNotEnoughRights, parseModeMarkdownObj);
                }
                else {
                    this.log(this.actionTypes.groupConfiguratiuon, msg);
                    const kbd = await this.getConfigKeyboard(msg.chat.id); // prepare keyboard
                    this.bot.sendMessage(
                        msg.from.id,
                        `* ${msg.chat.title}* configuration`,
                        Object.assign({}, parseModeMarkdownObj, { reply_markup: kbd })
                    );
                }
            }
        }
        else if (msg.chat.type === 'private') {
            this.log(this.actionTypes.tryingConfigureInPrivate, msg);
            this.bot.sendMessage(msg.chat.id, botMessages.shouldUseCommandInSuperGroups);
        }
        else if (msg.chat.type === 'group') {
            this.log(this.actionTypes.tryingConfigureNormalGroup, msg);
            this.bot.sendMessage(msg.from.id, botMessages.normalGroupNotSupported);
        }
    }

    async warnCommand(msg) {
        const maxWarn = 3;
        let admins = await this.commonFunctions.getChatAdmins(msg.chat);
        if (this.commonFunctions.messageSenderIsAdmin(admins, msg) && !this.commonFunctions.messageSenderIsAdmin(admins, msg.reply_to_message)) {
            await this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $inc: { warn: 1 } }, { upsert: true });
            let warns = (await this.collections.mongoWarns.findOne({ user: msg.reply_to_message.from.id, group: msg.chat.id })).warn;
<<<<<<< HEAD
            this.bot.sendMessage(msg.chat.id, `${msg.reply_to_message.from.first_name} has been warned by admin. *${warns}/${maxWarn}*`, { parse_mode: "markdown" })
=======
            this.bot.sendMessage(msg.chat.id, `${msg.reply_to_message.from.first_name} has been warned by admin. *${warns}/${maxWarn}*`, { parse_mode: 'markdown' });            
>>>>>>> Added eslint, .editorconfig, style refactoring
            if (warns >= maxWarn) {
                this.bot
                    .kickChatMember(msg.chat.id, msg.reply_to_message.from.id)
                    .then(() => this.bot.unbanChatMember(msg.chat.id, msg.reply_to_message.from.id));

                await this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $set: { warn: 0 } });
            }
        }
    }

    async unwarnCommand(msg) {
        let admins = await this.commonFunctions.getChatAdmins(msg.chat);
        if (this.commonFunctions.messageSenderIsAdmin(admins, msg)) {
            this.collections.mongoWarns.updateOne({ user: msg.reply_to_message.from.id, group: msg.chat.id }, { $set: { warn: 0 } });
        }
    }

    helpCommand(msg) {
        this.log(this.actionTypes.help, msg);
        this.bot.sendMessage(msg.from.id, botMessages.helpText, parseModeMarkdownObj);
    }

    /**
     *
     * @param {Object} msg
     * @param {String} linksString
     * @returns {Promise.<void>}
     */
    async whiteList(msg, linksString) {
        const { mongoGroups } = this.collections;
        const links = parseLinksFromMessage(msg);
        let group = await this.getGroupThatUserCurrentlyConfigures(msg);
        if (group) {
            const groupId = group.id;
            group = await mongoGroups.findOne({ groupId });
            const prevWhiteList = group.whiteList || [];

            if (links.length === 0) {
                if (linksString && linksString.length > 0) {
                    this.log(this.actionTypes.whitelistNoLinksProvided, msg);
                    this.bot.sendMessage(msg.from.id, botMessages.noLinksProvided);
                    return;
                }

                this.log(this.actionTypes.whitelistView, msg);
                this.bot.sendMessage(msg.from.id, prevWhiteList.join('\n') || botMessages.whiteListEmpty);
            } else {
                const whiteList = Array.from(new Set(prevWhiteList.concat(links)));
                await mongoGroups.updateOne({ groupId }, { $set: { whiteList } }, { upsert: true });
                const message = links.map(l =>
                    prevWhiteList.includes(l)
                        ? `Already in whitelist: ${l}.`
                        : `Added: ${l}.`
                ).join('\n');

                this.log(this.actionTypes.whitelistAdding, msg);
                this.bot.sendMessage(msg.from.id, message);
            }
        } else {
            this.sendExpireMessage(msg, msg.from.id);
        }
    }

    /**
     *
     * @param {Object} msg
     * @param {String} linksString
     * @returns {Promise.<void>}
     */
    async unWhiteList(msg, linksString) {
        const { mongoGroups } = this.collections;
        const links = parseLinksFromMessage(msg);
        let group = await this.getGroupThatUserCurrentlyConfigures(msg);
        if (group) {
            const groupId = group.id;
            group = await mongoGroups.findOne({ groupId });
            const prevWhiteList = group.whiteList || [];

            if (linksString === ' -') {
                const whiteList = [];
                await mongoGroups.updateOne({ groupId }, { $set: { whiteList } }, { upsert: true });

                this.log(this.actionTypes.whitelistClear, msg);
                this.bot.sendMessage(msg.from.id, botMessages.whiteListCleared);
            } else if (links.length > 0) {
                const message = links.map(l =>
                    prevWhiteList.includes(l)
                        ? `Deleted: ${l}.`
                        : `Not in whitelist: ${l}.`
                ).join('\n');

                const whiteList = prevWhiteList.filter(l => !links.includes(l));
                await mongoGroups.updateOne({ groupId }, { $set: { whiteList } }, { upsert: true });

                this.log(this.actionTypes.whitelistRemoveLinks, msg);
                this.bot.sendMessage(msg.from.id, message);
            }
        } else {
            this.sendExpireMessage(msg, msg.from.id);
        }
    }

    async maxLengthCommand(msg, lengthStr) {
        const {mongoGroups} = this.collections
        let group = await this.getGroupThatUserCurrentlyConfigures(msg);
        if (!group) {
            this.sendExpireMessage(msg, msg.chat.id);
            return
        }

        const length = Number(lengthStr)
        await mongoGroups.updateOne({ groupId: group.id }, { $set: { maxMessageLength: length || 0 } }, { upsert: true });
        if (length || 0) {
            this.bot.sendMessage(msg.chat.id, "Message length limit is set to " + length)
        } else {
            this.bot.sendMessage(msg.chat.id, "Message length limit is disabled")
        }
    }

    async menuCallback(query) {
        this.log(this.actionTypes.keyboardCallback, query);
        const groupId = Number(query.data.split('#')[0]);
        const prop = query.data.split('#')[1]; // get info from button
        const group = await this.collections.mongoGroups.findOne({ groupId });
        const val = !group[prop]; // switch selected button
        await this.collections.mongoGroups.updateOne({ groupId }, { $set: { [prop]: val } });
        const kbd = await this.getConfigKeyboard(groupId); // update keyboard
        this.bot.editMessageReplyMarkup(kbd, {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        });
    }

    startCommand(msg) {
        this.log(this.actionTypes.start, msg);
        this.bot.sendMessage(msg.from.id, botMessages.afterStartCommand);
    }

    async setHelloCommand(msg, match) {
        if (msg.chat.type === 'private') {
            const message = match[2];
            const group = await this.getGroupThatUserCurrentlyConfigures(msg);
            if (group) {
                this.log(this.actionTypes.setHello, msg);
                await this.collections.mongoGroups.updateOne({ groupId: group.id }, { $set: { helloMsgString: message } });

                if (message) {
                    this.bot.sendMessage(msg.chat.id, `_Hello message for group_ *${group.title}* _set to: _\n${message}`, { parse_mode: 'markdown' });
                } else {
                    this.bot.sendMessage(msg.chat.id, botMessages.helloMessageSetToDefault, parseModeMarkdownObj);
                }
            }
            else {
                this.sendExpireMessage(msg, msg.chat.id);
            }
        }
    }

    async logCommand(msg) {
        const group = await this.getGroupThatUserCurrentlyConfigures(msg);
        if (!group) {
            this.sendExpireMessage(msg, msg.from.id);
        }

        this.log(this.actionTypes.log, msg);
        this.collections.mongoActionLog.find({ actionDate: { $gte: this.commonFunctions.secondsAgo(60 * 60 * 48) }, 'payload.chat.id': group.id }).toArray((e, docs) => {
            if (e) {
                console.log(e);
                return;
            }

            const message = docs.map(x => `${x.eventType}:: ${x.payload.from.first_name || x.payload.from.username}:: ${x.payload.text}`).join('\n');
            this.bot.sendMessage(msg.from.id, message);
        });
    }

    async getConfigKeyboard(chatId) { // prepare config keyboard		
        const res = await this.collections.mongoGroups.findOne({ groupId: chatId });
        if (!res || res.length === 0) {
            const g = groupConfig(chatId);
            await this.collections.mongoGroups.insertOne(g);

            return this.getSetOfKeys(g);
        } else {
            return this.getSetOfKeys(res);
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
        };
    }

    async getGroupThatUserCurrentlyConfigures(msg) {
        const currentlyEdit = await this.collections.mongoNowConfigatates
            .findOne({ user: msg.from.id, date: { $gte: this.commonFunctions.secondsAgo(600) } })
            .catch(console.dir);

        return currentlyEdit && currentlyEdit.group;
    }
}

module.exports = Commands;
