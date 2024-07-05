const mongoose = require("mongoose");

const categoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'fashion'],
        default: 'general'
    },
    platformCharge: {
        type: Number,
        default: 0
    },
    discount2:{
        type:Number,
        default:2
    },
    description: String,
    attribute: {
        size: {
            type:Boolean,
            default:false
        },
        color: {
            type:Boolean,
            default:false
        },
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const Category = mongoose.model('Category', categoryModel)
module.exports = Category;