const {mongoose} = require('./../mongoose');

const mongoNowConfigatatesSchema = new mongoose.Schema({
    user:{
        type:Number,
        required:true
    },
    group:{
        id:{
            type:Number,
            required:true
        },
        title:String,
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
}, {collection: 'nowConfigurates'});
let mongoNowConfigatates = mongoose.model('nowConfigurates', mongoNowConfigatatesSchema);
module.exports = { mongoNowConfigatates };