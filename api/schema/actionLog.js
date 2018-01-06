const {mongoose} = require('./../mongoose');
const actionLogSchema = new mongoose.Schema({ 
    actionDate:{
        type:Date,
        default:Date.now()
    },
    eventType:{
        type:String,
        required:true
    },
    payload:[],
    createdAt:{
        type:Date,
        default:Date.now()
    }
}, {collection: 'actionLog'});
let actionLog = mongoose.model('actionLog', actionLogSchema);
module.exports = { actionLog };