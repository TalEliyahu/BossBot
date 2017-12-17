const {mongoose} = require('./../mongoose');

const mongoBlacklistSchema = new mongoose.Schema({
    groupId: String,
    words: []
});

let mongoBlacklist = mongoose.model('mongoBlacklist', mongoBlacklistSchema);
module.exports = { mongoBlacklist };