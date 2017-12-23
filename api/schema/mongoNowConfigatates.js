const {mongoose} = require('./../mongoose');

const mongoNowConfigatatesSchema = new mongoose.Schema({
    
 }, {collection: 'mongoNowConfigatates'});
let mongoNowConfigatates = mongoose.model('mongoNowConfigatates', mongoNowConfigatatesSchema);
module.exports = { mongoNowConfigatates };