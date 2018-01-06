const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const events = require('events');
const event = new events.EventEmitter();
const mongoConection = getConnection();
let db = null;

MongoClient.connect(mongoConection, function (err, database) {
    if (err) throw err;
    db = database;
    event.emit('connect');
});

exports.db = function (fn) {
    if (db) {
        fn(db);
    } else {
        event.on('connect', function () {
            fn(db);
        });
    }
};

function getConnection(){
    if(process.env.NODE_ENV=='test'){
        return (process.env.TEST_CONNECTION || require('./../config').test_connection);
    }else{
        return (process.env.MONGO_CONNECTION || require('./../config').mongo_connection);
    }
}