# Telegram Bot for Admins
Open-source bot that helps you to administrate Telegram groups.

Follow Us On [![alt text][2.1]][2]

[2.1]: http://i.imgur.com/P3YfQoD.png 
[2]: http://www.facebook.com/SingaporeTechEntrepreneurs/

## Installing
If you are about to obtain your own copy/fork of this bot complete the following steps:

1) Clone repo
```
$ git clone https://github.com/Singapore-Tech-Entrepreneurs/telegram_bot_for_admins.git
```

2) Install dependencies (you need [node.js](https://nodejs.org/) and NPM installed)
```
$ cd telegram_bot_for_admins
$ npm install
```

3) Create `config.json` file (you have `config-example.json`, you can copy and edit it). Fill it with your bot api token and mongo connection string. To obtain telegram bot token you may need to use [BotFather](http://t.me/BotFather). Free mongo database you can obtain at [mlab.com](http://mlab.com), for example.

4) Run it
```
$ npm start
```

## Using
1) Add your bot to supergroup.
2) Promote him to admin
3) Activate bot by sending him any message.
4) Configure it by typing `/config` right in your group. This step is important, because you can administer more than one group, so bot need to know, what group you want to configure right now. 
5) Bot will send you keyboard (in private message), that you can use to toggle message filters and more.

## Features

You can activate and configure features in the menu, that bot sends you by typing `/config` in the supergroup you want to configure. You must be admin of this supergroup.

Just push the button with function you want to toggle.

### Delete "`%user%` joined the group" messages
If enabled, bot will delete all "%user% joined the group" and "%user% left the group" service messages. That works only for new messages that was sent when option was enabled.

### Delete "`%user%` pinned «`%message%`»"
Works same as above for "pinned" service messages

### Delete arabic messages
If enabled, bot will delete all mesages with any arabic symbols.

### Delete messages with urls
If enabled, bot will delete all mesages with urls. Urls are detected by default telegram mechanism.

### Delete messages with commands
If enabled, bot will delete all mesages with commands, e.g. "`/config`"

### Restrict spam
If enabled, bot will delete messages that user sends too frequently. Rules and type of restriction will be configurable in future releases.


## Contibution
You are free to help us to implement new features that described in issues. Please, make PRs into `develop` branch.
