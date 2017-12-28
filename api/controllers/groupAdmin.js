const { userGroup } = require('./../schema/userGroup');
const { messagesLog } = require('./../schema/message');
const { member } = require('./../schema/member');

exports.getGroups = async function (req, res){
    const user_id = parseInt(req.body.id);
    try {
        const result = await userGroup.getGroupStats(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};


exports.getDashboardStats = async (req, res) => {
    const user_id = parseInt(req.body.id);
    try {
        let result = await userGroup.getUserGroups(user_id);
        const groups = result.length || 0;
        const groupIds = result.map(x => x.group);
        result = await member.getGroupMembers(groupIds);
        const members = result.length || 0;
        result= await messagesLog.getGroupData(groupIds);
        const messages = result.messages || 0 ;
        const actions = result.actions || 0;
        res.send({ 'groups': groups, 'members': members, 'messages': messages, 'actions': actions });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getMessagesYearlyCount = async (req, res) => {
    const user_id = parseInt(req.body.id);
    try {
        const result = await userGroup.getYearlyCount(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }

};

exports.getMessagesMonthlyCount = async (req, res) => {
    const user_id = parseInt(req.body.id);
    try {
        const result = await userGroup.getMonthlyCount(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupStats = async (req, res) => {
    const user_id = parseInt(req.body.id);
    const group_id = parseInt(req.body.group_id);
    try {
        let result = await userGroup.getMemberStats(user_id,group_id);
        const members = result[0].members;
        const messages = result[0].messages;
        try {
            result = await messagesLog.getGroupData([ group_id ]);
            res.send({ 'actions': result.actions || 0, 'members': members, 'messages': messages });
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
        const result = await messagesLog.getRecentMessages(group_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupMembers = async (req, res) => {
    const group_id = parseInt(req.body.group_id);
    try {
        const result = await member.findByGroupId(group_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getGroupMessagesYearlyCount = async (req, res) => {
    let group_id = parseInt(req.body.group_id);
    try {
        let result = await messagesLog.getMessagesYearlyCount(group_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};


exports.getGroupMessagesMonthlyCount = async (req, res) => {
    const group_id = parseInt(req.body.group_id);
    try {
        const result = await messagesLog.getMessagesMonthlyCount(group_id);
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
