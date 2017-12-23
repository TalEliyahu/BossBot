const {mongoose} = require('./../mongoose');

const mongoGroupsSchema = new mongoose.Schema({

 }, {collection: 'mongoGroups'});
let mongoGroups = mongoose.model('mongoGroups', mongoGroupsSchema);
module.exports = { mongoGroups };