var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var events = require('events');
var event = new events.EventEmitter();
const mongoConection = process.env.MONGO_CONNECTION || require('./../config').mongo_connection
var db;

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
}