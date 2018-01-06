const {mongoose} = require('./../mongoose');

const schema = new mongoose.Schema({
    userId: {
        type:Number,
        required:true
    },
    name: String,
    username:String,
    accessible:{
        type:Boolean,
        default:true
    },
    groups: [],
    created_at:{
        type:Date,
        default:Date.now()
    }
});

const User = mongoose.model('user', schema);
module.exports = { User };