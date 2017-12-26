const {mongoose} = require('./../mongoose');
const memberSchema = new mongoose.Schema({ 
    userid:{
        type: Number,
        required: true
      },
    firstname:String,
    lastname:String,
    username:String,
    groupId:{
        type: Number,
        required: true
      },
    joinDate:{
        type:Date,
        Default:Date.now()
    },
    createdAt:{
        type:Date,
        default:Date.now()
    } 
}, {collection: 'members'});
let member = mongoose.model('member', memberSchema);
module.exports = { member };