const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique:true,
        trim:true
    },
    role: {
        type: String,
        enum: ['admin', 'product-manager', 'delivery-manager', 'order-manager', 'review-manager'],
        required:true
    }
})

const Management = mongoose.model('Management', schema);
module.exports = Management;