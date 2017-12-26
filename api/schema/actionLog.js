const {mongoose} = require('./../mongoose')
const actionLogSchema = new mongoose.Schema({ 
    actionDate:{
        type:Date,
        default:Date.now()
    },
    evenType:String,
    payload:[],
    createdAt:{
        type:Date,
        default:Date.now()
    }
}, {collection: 'actionLog'})
let actionLog = mongoose.model('actionLog', actionLogSchema);
module.exports = { actionLog };