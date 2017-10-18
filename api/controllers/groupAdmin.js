const mongodb = require ('mongodb');


exports.getGroups = (mongoCollections) => {
    return (req, res) => {
        user_id = parseInt(req.body.id);
        mongoCollections.mongoUserGroups.aggregate([
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
                    last_message: {$max: '$messages.postedDate'},
                    members: { $size: "$members" }
                }
            }
        ], (err, result) => {
            if (err)
                res.status(500).send(err);
            else res.send(result);
        })
    }
}

exports.getDashboardStats = (mongoCollections) => {
    return (req, res) => {
        user_id = parseInt(req.body.id);
        let groups = 0;
        let members = 0;
        let messages = 0;
        let actions = 0;
        mongoCollections.mongoUserGroups.aggregate([
            {
                $match: {
                    user: user_id
                }
            },
            {
                $project: {
                    group: "$group.id"
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err);
            else {
                groups = result.length;
                let groupIds = result.map(x => { return x.group })
                mongoCollections.mongoGroupMembers.find({ groupId: { $in: groupIds } }).toArray((err, result) => {
                    if (err) res.status(500).send(err);
                    members = result.length
                    mongoCollections.mongoMessages.find({ "message.chat.id": { $in: groupIds } }).toArray((err, result) => {
                        if (err) res.status(500).send(err);
                        messages = result.filter(x => { return x.message.entities == null }).length
                        actions = result.filter(x => { return x.message.entities != null }).length
                        res.send({ "groups": groups, "members": members, "messages": messages, "actions": actions });
                    });
                })
            }
        })
    }
}

exports.getMessagesYearlyCount = (mongoCollections) => {
    return (req, res) => {
        user_id = parseInt(req.body.id);
        mongoCollections.mongoUserGroups.aggregate([
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
                    month: {"$month": '$messages.postedDate'},
                    messageYear: {"$year": "$messages.postedDate"}
                }
            },
            {
                $group: {
                    _id: {month: "$month", year: "$messageYear"},
                    messages: {$sum: 1}
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err);
                res.send(result);
        })
    }
}

exports.getMessagesMonthlyCount = (mongoCollections) => {
    return (req, res) => {
        user_id = parseInt(req.body.id);
        var month = (new Date()).getMonth() + 1;
        mongoCollections.mongoUserGroups.aggregate([
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
                    day: {"$dayOfMonth": '$messages.postedDate'},
                    messageMonth: {"$month": "$messages.postedDate"}
                }
            },
            {
                $group: {
                    _id: {day: "$day", month: "$messageMonth"},
                    messages: {$sum: 1}
                }
            },
            {
                $match: {
                    '_id.month': month
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err);
                res.send(result);
        })
    }
}

exports.getGroupStats = (mongoCollections) => {
    return (req, res) => {
        user_id = parseInt(req.body.id)
        group_id = parseInt(req.body.group_id)
        var members = 0;
        var messages = 0;
        var banned = 0;
        var actions = 0;
        mongoCollections.mongoUserGroups.aggregate([
            {
                $match: {
                    "group.id": group_id,
                    "user":  user_id
                }
            },
            {
                $lookup: {
                    from: "messagesLog",
                    localField: "group.id",
                    foreignField: "message.chat.id",
                    as: "messages"
                }
            },
            {
                $lookup: {
                    from: "members",
                    localField: "group.id",
                    foreignField: "groupId",
                    as: "members"
                }
            },
            {
                $project: {
                    members: {$size: "$members"},
                    messages: {$size: "$messages"}
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err)
            members = result[0].members;
            messages = result[0].messages;
            mongoCollections.mongoMessages.find({'message.chat.id': group_id}).toArray((err, result)=> {
                if (err) res.status(500).send(err)
                res.send({"actions": result.filter(x => x.message.entities != null).length, "members": members, "messages": messages})
            })
        });
        
    }
}

exports.getGroupMessages = (mongoCollections) => {
    return (req, res) => {
        group_id = parseInt(req.body.group_id)
        mongoCollections.mongoMessages.aggregate([
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
        ], (err, result)=> {
            if (err) res.status(500).send(err)
            res.send(result)
        });
    }
}

exports.getGroupMembers = (mongoCollections) => {
    return (req, res) => {
        group_id = parseInt(req.body.group_id);
        mongoCollections.mongoGroupMembers.find({groupId: group_id}).toArray((err, result) => {
            if (err) res.status(500).send(err)
            res.send(result)
        });
    }
}

exports.getGroupMessagesYearlyCount = (mongoCollections) => {
    return (req, res) => {
        group_id = parseInt(req.body.group_id);
        mongoCollections.mongoMessages.aggregate([
            {
                $match: {
                    'message.chat.id': group_id
                }
            },
            {
                $project: {
                    month: {"$month": '$postedDate'},
                    messageYear: {"$year": "$postedDate"}
                }
            },
            {
                $group: {
                    _id: {month: "$month", year: "$messageYear"},
                    messages: {$sum: 1}
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err);
                res.send(result);
        })
    }
}

exports.getGroupMessagesMonthlyCount = (mongoCollections) => {
    return (req, res) => {
        group_id = parseInt(req.body.group_id);
        var month = (new Date()).getMonth() + 1;
        mongoCollections.mongoMessages.aggregate([
            {
                $match: {
                    'message.chat.id': group_id
                }
            },
            {
                $project: {
                    day: {"$dayOfMonth": '$postedDate'},
                    messageMonth: {"$month": "$postedDate"}
                }
            },
            {
                $group: {
                    _id: {day: "$day", month: "$messageMonth"},
                    messages: {$sum: 1}
                }
            },
            {
                $match: {
                    '_id.month': month
                }
            }
        ], (err, result) => {
            if (err) res.status(500).send(err);
                res.send(result);
        })
    }
}
