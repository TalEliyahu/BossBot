const {mongoose} = require('./../mongoose');

const mongoAllowedAdminsSchema = new mongoose.Schema({
    groupId:{
        type:Number,
        required:true
    },
    moderators:[],
    createdAt:{
        type:Date,
        default:Date.now()
    }
 }, {collection: 'allowedAdmins'});
let mongoAllowedAdmins = mongoose.model('allowedAdmins', mongoAllowedAdminsSchema);
module.exports = { mongoAllowedAdmins };