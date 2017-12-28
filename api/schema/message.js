const {mongoose} = require('./../mongoose');
const messagesLogSchema = new mongoose.Schema({
    postedDate:{
        type:Date,
        default:Date.now()
    },
    message:{},
    createdAt:{
        type:Date,
        default:Date.now()
    } 
}, {collection: 'messagesLog'});

messagesLogSchema.statics.getGroupData = async (groupIds) => {
    let result = await messagesLog.find({ 'message.chat.id': { $in: groupIds } });
    result = result.map(o => o.toObject());
    const messages = result.filter(x => { return x.message.entities === undefined; }).length;
    const actions = result.filter(x => { return x.message.entities !== undefined; }).length;
    return { messages, actions };

};

messagesLogSchema.statics.getRecentMessages = async (groupId) => {
    return messagesLog.aggregate([
        {
            $match: {
                'message.chat.id': groupId
            }
        },
        {
            $sort: {
                'postedDate': -1
            }
        },
        { $limit : 25 } // kept 25 for performance, change when needed
    ]);

};


messagesLogSchema.statics.getMessagesYearlyCount = async (groupId) => {
    return messagesLog.aggregate([
        {
            $match: {
                'message.chat.id': groupId
            }
        },
        {
            $project: {
                month: { '$month': '$postedDate' },
                messageYear: { '$year': '$postedDate' }
            }
        },
        {
            $group: {
                _id: { month: '$month', year: '$messageYear' },
                messages: { $sum: 1 }
            }
        }
    ]);

};


messagesLogSchema.statics.getMessagesMonthlyCount = async (groupId) => {
    const month = (new Date()).getMonth() + 1;
    return messagesLog.aggregate([
        {
            $match: {
                'message.chat.id': groupId
            }
        },
        {
            $project: {
                day: { '$dayOfMonth': '$postedDate' },
                messageMonth: { '$month': '$postedDate' }
            }
        },
        {
            $group: {
                _id: { day: '$day', month: '$messageMonth' },
                messages: { $sum: 1 }
            }
        },
        {
            $match: {
                '_id.month': month
            }
        }
    ]);

};

let messagesLog = mongoose.model('messagesLog', messagesLogSchema);
module.exports = { messagesLog };