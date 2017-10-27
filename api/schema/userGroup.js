const {mongoose} = require('./../mongoose');
const userGroupSchema = new mongoose.Schema({ }, {collection: 'userGroups'});
let userGroup = mongoose.model('userGroup', userGroupSchema);
module.exports = { userGroup };