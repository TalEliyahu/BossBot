const {mongoose} = require('./../mongoose');
const userGroupSchema = new mongoose.Schema({
    user:{
        type:Number,
        required:true
    },
    group:{
        id:Number,
        title:String,
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
 }, {collection: 'userGroups'});
let userGroup = mongoose.model('userGroup', userGroupSchema);
module.exports = { userGroup };