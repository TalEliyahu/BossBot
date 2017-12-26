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


userGroupSchema.statics.getGroupStats = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'members',
                localField: 'group.id',
                foreignField: 'groupId',
                as: 'members'
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $project: {
                group: 1,
                date: 1,
                last_message: { $max: '$messages.postedDate' },
                members: { $size: '$members' }
            }
        }
    ]);
};

userGroupSchema.statics.getUserGroups = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $project: {
                group: '$group.id'
            }
        }
    ]);
};

userGroupSchema.statics.getYearlyCount = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $unwind: {
                path: '$messages',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                month: { '$month': '$messages.postedDate' },
                messageYear: { '$year': '$messages.postedDate' }
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

userGroupSchema.statics.getMonthlyCount = async function (userId) {
    const month = (new Date()).getMonth() + 1;
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $unwind: {
                path: '$messages',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                day: { '$dayOfMonth': '$messages.postedDate' },
                messageMonth: { '$month': '$messages.postedDate' }
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

userGroupSchema.statics.getMemberStats = async function (userId,groupId) {
    return userGroup.aggregate([
        {
            $match: {
                'group.id': groupId,
                'user': userId
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $lookup: {
                from: 'members',
                localField: 'group.id',
                foreignField: 'groupId',
                as: 'members'
            }
        },
        {
            $project: {
                members: { $size: '$members' },
                messages: { $size: '$messages' }
            }
        }
    ]);

};

userGroupSchema.statics.getBotActivity = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'actionLog',
                localField: 'group.id',
                foreignField: 'payload.chat.id',
                as: 'actions'
            }
        },
        {
            $unwind: {
                path: '$actions'
            }
        },
        {
            $project: {
                month: { $month: '$actions.actionDate' },
                year: { $year: '$actions.actionDate' }
            }
        },
        {
            $group: {
                _id: { month: '$month', year: '$year' },
                actions: { $sum: 1 }
            }
        },
        {
            $match: {
                '_id.year': (new Date()).getFullYear
            }
        }
    ])

};

userGroupSchema.statics.getActiveUsers = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $unwind: {
                path: '$messages'
            }
        },
        {
            $group: {
                _id: {
                    user: '$messages.message.from.id',
                    first_name: '$messages.message.from.first_name',
                    last_name: '$messages.message.from.last_name'
                },
                messages: { $sum: 1 }
            }
        },
        {
            $sort: {
                messages: -1
            }
        }
    ]);

};

userGroupSchema.statics.getActiveAdmins = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'messagesLog',
                localField: 'group.id',
                foreignField: 'message.chat.id',
                as: 'messages'
            }
        },
        {
            $unwind: {
                path: '$messages'
            }
        },
        {
            $match: {
                'messages.message.entities' : {
                    $ne : null
                }
            }
        },
        {
            $project: {
                id: '$messages.message.from.id',
                first_name: '$messages.message.from.first_name',
                last_name: '$messages.message.from.last_name'
            }
        },
        {
            $group: {
                _id: {
                    id: '$id',
                    first_name: '$first_name',
                    last_name: '$last_name'
                },
                actions: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'userGroups',
                localField: '_id.id',
                foreignField: 'user',
                as: 'admins'
            }
        },
        {
            $unwind: {
                path: '$admins'
            }
        },
        {
            $group: {
                _id: {
                    id: '$_id.id',
                    first_name: '$_id.first_name',
                    last_name: '$_id.last_name',
                    actions: '$actions'
                }
            }
        }
    ]);
};

userGroupSchema.statics.getDeletedMessagesDetails = async function (userId) {
    return userGroup.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'actionLog',
                localField: 'group.id',
                foreignField: 'payload.chat.id',
                as: 'actions'
            }
        },
        {
            $unwind: {
                path: '$actions'
            }
        },
        {
            $match: {
                'actions.eventType': 'DELETE_FILTERED_MESAGE'
            }
        },
        {
            $group: {
                _id: {
                    month: {$month: '$date'},
                    year: {$year: '$date'}
                },
                count: { $sum : 1 }
            }
        },
        {
            $match: {
                '_id.year' : (new Date()).getFullYear
            }
        }
    ])
};

let userGroup = mongoose.model('userGroup', userGroupSchema);
module.exports = { userGroup };