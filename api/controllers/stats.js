const { userGroup } = require('./../schema/userGroup');

exports.botActivity = async (req, res) => {
    try {
        const user_id = parseInt(req.body.id);
        const result = await userGroup.getBotActivity(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.activeUsers = async (req, res) => {
    try {
        const user_id = parseInt(req.body.id);
        const result = await userGroup.getActiveUsers(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.activeAdmins = async (req, res) => {
    try {
        const user_id = parseInt(req.body.id);
        const result = await userGroup.getActiveAdmins(user_id);
        res.send(result);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deletedMessages = async (req, res) => {
    try {
        const user_id = parseInt(req.body.id);
        const result = await userGroup.getDeletedMessagesDetails(user_id);
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