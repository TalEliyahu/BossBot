const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./controllers/config')
const authController = require('./controllers/auth')
const group = require ('./routes/group')
const dashboard = require('./routes/dashboard')
const stats = require('./routes/stats')
const auth = require ('./routes/auth')
const port = 3000
const app = express()

module.exports = {
    serve: () => {
        // app.use(cors)
        app.use(config.headerSetting)
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())
        app.use('/', auth)
        app.use('/dashboard', dashboard)
        app.use('/group', group)
        app.use('/stats', stats)
        app.listen(port, () => {
            console.log('Listening at port :' + port);
        }).on('error', function (err) {
            console.log(err);
        });
    }
}