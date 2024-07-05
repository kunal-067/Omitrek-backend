const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        text:true
    },
    uniqueName: {
        type:String,
        required:true,
        trim:true,
        unique:true,
        text:true
    },
    phone: Number,
    email: String,
    GST: String,
    description: String,

    shopImage: String,

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique:true,
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    address: {
        address: String,
        street: String,
        city: String,
        state: String,
        pincode: Number,
        country: String
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productType: {
            type: String,
            enum: ['general', 'fashion'],
            default: 'general'
        }
    }],

    status: {
        type: String,
        enum: ['Pending', 'Approved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})


shopSchema.index({"location":"2dsphere"})
const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;