const {mongoose} = require('./../mongoose');

const mongoGroupsSchema = new mongoose.Schema({
    joinedmsg:{
        type:Boolean,
        default:false
    },
    pinnedMsg:{
        type:Boolean,
        default:false
    },
    arabicMsg:{
        type:Boolean,
        default:false
    },
    urlMsg:{
        type:Boolean,
        default:false
    },
    restrictSpam:{
        type:Boolean,
        default:false
    },
    deleteCommands:{
        type:Boolean,
        default:false
    },
    groupId:{
        type:Number,
        required:true
    },
    helloMsg:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
 }, {collection: 'groups'});
let mongoGroups = mongoose.model('groups', mongoGroupsSchema);
module.exports = { mongoGroups };