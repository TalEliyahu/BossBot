const {mongoose} = require('./../mongoose');

const mongoWhiteListSchema = new mongoose.Schema({
    groupId:{
        type:String,
        required:true
    },
    links:[],
    createdAt:{
        type:Date,
        default:Date.now()
    }
}, {collection: 'mongoWhiteList'});
let mongoWhiteList = mongoose.model('mongoWhiteList', mongoWhiteListSchema);
module.exports = { mongoWhiteList };