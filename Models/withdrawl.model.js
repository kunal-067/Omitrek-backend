const mongoose = require("mongoose");

const withdrawlSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    amount:Number,
    upi:String,
    status:{
        type:String,
        enum:['pending', 'approved', 'declined'],
        default:'pending'
    },
    approvedAt:Date,
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Withdrawl = mongoose.model('withdrawl', withdrawlSchema);
module.exports = Withdrawl;