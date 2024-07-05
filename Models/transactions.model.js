const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    upi: String,
    amount: Number,
    // orderId:mongoose.Schema.Types.ObjectId,
    paidFor: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:'User'
    },
    paidForDetail: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    status: {
        type: String,
        default: 'pending'
    },
    paidAt: {
        type: Date,
        default: Date.now()
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction;