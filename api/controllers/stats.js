const { actionLog } = require('./../schema/actionLog')
const { userGroup } = require('./../schema/userGroup')

exports.botActivity = async (req, res) => {
    try {
        user_id = parseInt(req.body.id)
        let result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
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
        console.log(result)
        res.send(result)
    } catch (error) {
        handleError(res, error)
    }
}

exports.activeUsers = async (req, res) => {
    try {
        user_id = parseInt(req.body.id)
        let result = await userGroup.aggregate([
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
        ])
        res.send(result)
    } catch (error) {
        handleError(res, error)
    }
}

exports.activeAdmins = async (req, res) => {
    try {
        user_id = parseInt(req.body.id)
        let result = await userGroup.aggregate([
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
        ])
        res.send(result)
    } catch (error) {
        handleError(res, error)
    }
}

exports.deletedMessages = async (req, res) => {
    try {
        user_id = parseInt(req.body.id)
        let result = await userGroup.aggregate([
            {
                $match: {
                    user: user_id
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
        res.send(result)
    } catch (error) {
        handleError(res, error)
    }
}

function handleError(res, error) {
    console.log("error")
    console.log(error)
    res.status(500).send(error)
}