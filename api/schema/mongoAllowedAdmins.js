const {mongoose} = require('./../mongoose');

const mongoAllowedAdminsSchema = new mongoose.Schema({
    
 }, {collection: 'mongoAllowedAdmins'});
let mongoAllowedAdmins = mongoose.model('mongoAllowedAdmins', mongoAllowedAdminsSchema);
module.exports = { mongoAllowedAdmins };