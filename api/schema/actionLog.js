const {mongoose} = require('./../mongoose')
const actionLogSchema = new mongoose.Schema({ }, {collection: 'actionLog'})
let actionLog = mongoose.model('actionLog', actionLogSchema);
module.exports = { actionLog };