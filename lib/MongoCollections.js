
class MongoCollections {

    /**
      * 
      * @param {MongoCollection} mongoGroups 
      * @param {MongoCollection} mongoMessages 
      * @param {MongoCollection} mongoNowConfigatates 
      * @param {MongoCollection} mongoActionLog 
      * @param {MongoCollection} mongoWarns
      * @param {MongoCollection} mongoWhiteList
     */
    constructor(mongoGroups, mongoMessages, mongoNowConfigatates, mongoActionLog, mongoWarns, mongoWhiteList) {
        this.mongoGroups = mongoGroups;
        this.mongoMessages = mongoMessages;
        this.mongoNowConfigatates = mongoNowConfigatates;
        this.mongoActionLog = mongoActionLog;
        this.mongoWarns = mongoWarns;
        this.mongoWhiteList = mongoWhiteList;
    }
}

module.exports = MongoCollections;