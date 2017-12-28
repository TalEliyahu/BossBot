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

memberSchema.statics.getGroupMembers = async (groupIds) => {
    return member.find({ groupId: { $in: groupIds } });
};

memberSchema.statics.findByGroupId = async (groupId) => {
    return member.find(({ groupId: groupId }));
};


let member = mongoose.model('member', memberSchema);
module.exports = { member };