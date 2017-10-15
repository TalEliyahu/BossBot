var express = require('express');
var bodyParser = require('body-parser');
var config = require('./controllers/config');
var authController = require('./controllers/auth');
const port = process.env.PORT || 3000;

module.exports = {
    serve: function () {
        var app = express();
        app.use(bodyParser.json());
        app.use((req, res, next) => config.headerSetting(req, res, next));
        // ROUTES
        app.post('/login', authController.login);
        app.post('/sendCode', authController.sendCode);
        app.post('/sendcall', authController.sendCall);
        app.post('/signup', authController.signup);

        app.listen(port, () => {
            console.log('Listening at port :' + port);
        }).on('error', function (err) {
            console.log(err);
        });
    }
}