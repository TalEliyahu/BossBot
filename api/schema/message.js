const {mongoose} = require('./../mongoose');
const messagesLogSchema = new mongoose.Schema({
    postedDate:{
        type:Date,
        default:Date.now()
    },
    message:[],
    createdAt:{
        type:Date,
        default:Date.now()
    } 
 }, {collection: 'messagesLog'});
let messagesLog = mongoose.model('messagesLog', messagesLogSchema);
module.exports = { messagesLog };