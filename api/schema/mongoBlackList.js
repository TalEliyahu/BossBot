const {mongoose} = require('./../mongoose');

const mongoWhiteListSchema = new mongoose.Schema({
    
 }, {collection: 'mongoWhiteList'});
let mongoWhiteList = mongoose.model('mongoWhiteList', mongoWhiteListSchema);
module.exports = { mongoWhiteList };