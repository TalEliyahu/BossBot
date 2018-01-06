const {mongoose} = require('./../mongoose');

const mongoBlacklistSchema = new mongoose.Schema({
    groupId: {
        type:Number,
        required:true
    },
    words: [],
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

let mongoBlacklist = mongoose.model('blacklist', mongoBlacklistSchema);
module.exports = { mongoBlacklist };