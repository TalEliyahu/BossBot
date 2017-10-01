const MongoCollection = require('mongodb/lib/collection')

class MongoCollections {

    /**
      * 
      * @param {MongoCollection} mongoGroups 
      * @param {MongoCollection} mongoMessages 
      * @param {MongoCollection} mongoNowConfigatates 
      * @param {MongoCollection} mongoActionLog 
      * @param {MongoCollection} mongoWarns 
      */
    constructor(mongoGroups, mongoMessages, mongoNowConfigatates, mongoActionLog, mongoWarns) {
        this.mongoGroups = mongoGroups
        this.mongoMessages = mongoMessages
        this.mongoNowConfigatates = mongoNowConfigatates
        this.mongoActionLog = mongoActionLog
        this.mongoWarns = mongoWarns
    }
}

module.exports = MongoCollections