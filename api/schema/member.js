const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema({ }, {collection: 'members'});
let member = mongoose.model('member', memberSchema);
module.exports = { member };