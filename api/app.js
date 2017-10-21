const express = require('express')
const bodyParser = require('body-parser')
const config = require('./controllers/config')
const authController = require('./controllers/auth')
const group = require ('./routes/group')
const dashboard = require('./routes/dashboard')
const auth = require ('./routes/auth')
const port = process.env.PORT || 3000
const app = express()

module.exports = {
    serve: function (mongoCollections) {
        app.use(bodyParser.json())
        app.use((req, res, next) => config.headerSetting(req, res, next))
        app.use('/', auth)
        app.use('/dashboard', dashboard)
        app.use('/group', group)
        app.listen(port, () => {
            console.log('Listening at port :' + port);
        }).on('error', function (err) {
            console.log(err);
        });
    }
}