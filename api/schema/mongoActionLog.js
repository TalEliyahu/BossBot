const {mongoose} = require('./../mongoose');

const mongoActionLogSchema = new mongoose.Schema({

 }, {collection: 'mongoActionLog'});
let mongoActionLog = mongoose.model('mongoActionLog', mongoActionLogSchema);
module.exports = { mongoActionLog };