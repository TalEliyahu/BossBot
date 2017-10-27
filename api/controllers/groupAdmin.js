const { userGroup } = require('./../schema/userGroup');
const { messagesLog } = require('./../schema/message');
const { member } = require('./../schema/member');

exports.getGroups = async (req, res) => {
    const user_id = parseInt(req.body.id);
    try {
        let result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
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
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getDashboardStats = async (req, res) => {
    const user_id = parseInt(req.body.id);
    let groups = 0;
    let members = 0;
    let messages = 0;
    let actions = 0;
    try {
        let result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
                }
            },
            {
                $project: {
                    group: '$group.id'
                }
            }
        ]);
        groups = result.length;
        let groupIds = result.map(x => x.group);
        result = await member.find({ groupId: { $in: groupIds } });
        members = result.length;
        result = await messagesLog.find({ 'message.chat.id': { $in: groupIds } });
        result = result.map(o => o.toObject());
        messages = result.filter(x => { return x.message.entities === null; }).length;
        actions = result.filter(x => { return x.message.entities !== null; }).length;
        res.send({ 'groups': groups, 'members': members, 'messages': messages, 'actions': actions });

    } catch (error) {
        handleError(res, error);
    }
};

exports.getMessagesYearlyCount = async (req, res) => {
    const user_id = parseInt(req.body.id);
    try {
        const result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
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
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }

};

exports.getMessagesMonthlyCount = async (req, res) => {
    const user_id = parseInt(req.body.id);
    let month = (new Date()).getMonth() + 1;
    try {
        const result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
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
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupStats = async (req, res) => {
    const user_id = parseInt(req.body.id);
    const group_id = parseInt(req.body.group_id);
    try {
        let result = await userGroup.aggregate([
            {
                $match: {
                    'group.id': group_id,
                    'user': user_id
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
        let members = result[0].members;
        let messages = result[0].messages;
        try {
            result = await messagesLog.find({ 'message.chat.id': group_id });
            result = result.map(o => o.toObject()); //Schema not pre-defined and dynamic nature
            res.send({ 'actions': result.filter(x => x.message.entities !== null).length, 'members': members, 'messages': messages });
        } catch (error) {
            handleError(res, error);
        }
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupMessages = async (req, res) => {
    const group_id = parseInt(req.body.group_id);
    try {
        const result = await messagesLog.aggregate([
            {
                $match: {
                    'message.chat.id': group_id
                }
            },
            {
                $sort: {
                    'postedDate': -1
                }
            }
        ]);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupMembers = async (req, res) => {
    const group_id = parseInt(req.body.group_id);
    try {
        const result = await member.find({ groupId: group_id });
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupMessagesYearlyCount = async (req, res) => {
    let group_id = parseInt(req.body.group_id);
    try {
        let result = await messagesLog.aggregate([
            {
                $match: {
                    'message.chat.id': group_id
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
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};


exports.getGroupMessagesMonthlyCount = async (req, res) => {
    const group_id = parseInt(req.body.group_id);
    const month = (new Date()).getMonth() + 1;
    try {
        const result = await messagesLog.aggregate([
            {
                $match: {
                    'message.chat.id': group_id
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
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};


function handleError(res, error) {
    console.log('error');
    console.log(error);
    res.status(500).send(error);
}
