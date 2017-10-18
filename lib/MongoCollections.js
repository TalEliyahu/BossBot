const MongoCollection = require('mongodb/lib/collection');

class MongoCollections {

    /**
      * 
      * @param {MongoCollection} mongoGroups 
      * @param {MongoCollection} mongoMessages 
      * @param {MongoCollection} mongoNowConfigatates 
      * @param {MongoCollection} mongoActionLog 
      * @param {MongoCollection} mongoWarns
      * @param {MongoCollection} mongoWhiteList
      * @param {MongoCollection} mongoGroupMembers
      * @param {MongoCollection} mongoUserGroups
     */
    constructor(mongoGroups, mongoMessages, mongoNowConfigatates, mongoActionLog, mongoWarns, mongoWhiteList, mongoGroupMembers, mongoUserGroups) {
        this.mongoGroups = mongoGroups
        this.mongoMessages = mongoMessages
        this.mongoNowConfigatates = mongoNowConfigatates
        this.mongoActionLog = mongoActionLog
        this.mongoWarns = mongoWarns
        this.mongoWhiteList = mongoWhiteList;
        this.mongoGroupMembers = mongoGroupMembers;
        this.mongoUserGroups = mongoUserGroups
    }
}

module.exports = MongoCollections