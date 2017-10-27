const {mongoose} = require('./../mongoose');
const messagesLogSchema = new mongoose.Schema({ }, {collection: 'messagesLog'});
let messagesLog = mongoose.model('messagesLog', messagesLogSchema);
module.exports = { messagesLog };