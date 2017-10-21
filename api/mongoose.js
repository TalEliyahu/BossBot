const mongoose = require('mongoose');
mongoose.Promise = Promise;
const mongoConnection = process.env.MONGO_CONNECTION || require('./../config').mongo_connection
mongoose.connect(mongoConnection, { useMongoClient: true }, (err) => {
    if(err)
        console.log(err)
});
module.exports = { mongoose };