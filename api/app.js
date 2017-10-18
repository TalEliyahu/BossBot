var express = require('express');
var bodyParser = require('body-parser');
var config = require('./controllers/config');
var authController = require('./controllers/auth');
var groupAdminController = require ('./controllers/groupAdmin');
const port = process.env.PORT || 3000;

module.exports = {
    serve: function (mongoCollections) {
        var app = express();
        app.use(bodyParser.json());
        app.use((req, res, next) => config.headerSetting(req, res, next));
        // ROUTES
        app.post('/login', authController.login);
        app.post('/sendCode', authController.sendCode);
        app.post('/sendcall', authController.sendCall);
        app.post('/signup', authController.signup);
        app.post('/get-groups', groupAdminController.getGroups(mongoCollections));        
        app.post('/get-dashboard-stats', groupAdminController.getDashboardStats(mongoCollections));
        app.post('/get-messages-yearly-count', groupAdminController.getMessagesYearlyCount(mongoCollections));
        app.post('/get-messages-monthly-count', groupAdminController.getMessagesMonthlyCount(mongoCollections));
        app.post('/get-group-stats', groupAdminController.getGroupStats(mongoCollections));
        app.post('/get-group-messages', groupAdminController.getGroupMessages(mongoCollections));
        app.post('/get-group-members', groupAdminController.getGroupMembers(mongoCollections));
        app.post('/get-group-messages-yearly-count', groupAdminController.getGroupMessagesYearlyCount(mongoCollections));
        app.post('/get-group-messages-monthly-count', groupAdminController.getGroupMessagesMonthlyCount(mongoCollections));

        app.listen(port, () => {
            console.log('Listening at port :' + port);
        }).on('error', function (err) {
            console.log(err);
        });
    }
}