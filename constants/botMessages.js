
const askToSendConfig = (
    'You are currently no editing any groups. ' +
    'Send `/config` to group chat to start configure this group.'
);

const botHaveNotEnoughRights = (
    '_Bot have not enougth rights in this group! ' +
    'Promote him to admin, grant \'delete messages\' and \'ban users\' rights!_'
);

const shouldUseCommandInSuperGroups = 'You should use this command in supergroups that you want to configure';

const normalGroupNotSupported = 'Normal groups are not supported yet. Upgrade this group to supergroup first!';

const helpText = `*IMPORTANT*
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

const noLinksProvided = 'No links were provided. Please, write only links after whitelist command.';

const whiteListEmpty = 'Whitelist is empty.';

const whiteListCleared = 'Whitelist was cleared.';

const afterStartCommand = 'Well done! You can use /help command to get some documentation.';

const helloMessageSetToDefault = (
    '_You set hello message to default value. ' +
    'To disable it please switch button on config keyboard_'
);

module.exports = {
    askToSendConfig,
    botHaveNotEnoughRights,
    shouldUseCommandInSuperGroups,
    normalGroupNotSupported,
    helpText,
    noLinksProvided,
    whiteListEmpty,
    whiteListCleared,
    afterStartCommand,
    helloMessageSetToDefault
};
