# BossBot Telegram Bot for Admins

Open-source bot that helps you to administrate Telegram groups.

Follow Us On [![alt text][2.1]][2]

[2.1]: http://i.imgur.com/P3YfQoD.png 
[2]: http://www.facebook.com/SingaporeTechEntrepreneurs/

## Installing

If you are about to obtain your own copy/fork of this bot complete the following steps:

1. Clone repo

```sh
$ git clone https://github.com/Singapore-Tech-Entrepreneurs/telegram_bot_for_admins.git
```

1. Install dependencies (you need [node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed)

```sh
$ cd telegram_bot_for_admins
$ npm install
```

1. Create `config.json` file (you have `config-example.json`, you can copy and edit it). Fill it with your bot api token and mongo connection string. To obtain telegram bot token you may need to use [BotFather](http://t.me/BotFather). Free mongo database you can obtain at [mlab.com](http://mlab.com), for example.

```javascript
{
    "bot_token": "<tokenFromBotFather>",
    "mongo_connection": "<mongoDBConnection>"
}
```

1. Run it

```sh
$ npm start
```

## Using

1. Add your bot to supergroup.
1. Promote him to admin
1. Activate bot by sending him any message.
1. Configure it by typing `/setting` right in your group. This step is important, because you can administer more than one group, so bot needs to know, what group you want to configure right now.
1. Bot will send you keyboard (in private message), that you can use to toggle message filters and more.

## Features

You can activate and configure features in the menu, that bot sends you by typing `/setting` in the supergroup you want to configure. You must be admin of the supergroup.

Just push the button with function you want to toggle.

### Delete "`%user%` joined the group" messages

If enabled, bot will delete all "`%user%` joined the group" and "`%user%` left the group" service messages. That works only for new messages that was sent when option was enabled.

### Delete "`%user%` pinned «`%message%`»"

Works same as above for "pinned" service messages

### Delete arabic messages

If enabled, bot will delete all mesages with any arabic character.

### Delete messages with urls

If enabled, bot will delete all mesages with urls. Urls are detected by default telegram mechanism.

### Delete messages with Blacklisted words

If enabled, bot will delete all mesages containing blacklisted word/Sentences. To get all blacklisted words/Sentences in group use "`/blacklist`" in group.

### Reset blacklisted words

This will reset(remove) all the blacklisted words for a particular group.

### Delete messages with commands

If enabled, bot will delete all mesages with commands, e.g. "`/setting`"

### Restrict spam

If enabled, bot will delete messages that user sends too frequently. Rules and type of restriction will be configurable in future releases.

### Hello messages for new members

If enabled, bot will wellcome new members with provided message. You can change default message with "`/set_hello`" command. Read "`/help`" for more information.

### Allow admins to configure bot

If enabled, all admins of your group can use "`/setting`" command. If disabled, you can separately grant access to any admin in your group, using "`/access`" command.

## Chat commands

`/setting` - start to configure current group.

`/blacklist` - Gives a list of blacklisted word for current group, if replied to a message by admin by message will be blacklisted. 

`/kick` - removes user from chat. Need to be written in a reply to user you want to restrict.

`/ban` - removes and add user to blocklist. Need to be written in a reply to user you want to restrict.

`/warn` - warns user about unacceptable behavior. Increases "warns" counter for user. If counter reach 3 - user get banned. Need to be written in a reply to user you want to restrict.

`/unwarn` - clears "warns" counter. Need to be written in a reply.

## Bot command

`/set_hello %%%` - sets hello message for new users. Message can have placeholder `$name`. You can call `/set_hello` without message to set default message for current group. To disable Hello message use configuration keyboard.

`/blacklist %word%` Adds the new word to blacklist, turn on Delete blacklist from configuration keyboard to delete all messages with such words. 

`/help` - show help message.

`/access` - show access menu to separately configure admins that can configure bot for current group.

## Contibution

You are free to help us to implement new features that described in issues. Please, make PRs into `develop` branch.
