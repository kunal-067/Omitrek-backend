const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    name: {
        type: String,
        index: 'text',
        require: true
    },
    description: {
        type: String,
        index: 'text',
        require: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    mrp: {
        type: Number,
        require: true
    },
    sp:{
        type:Number,
        required:true
    },
    discount: {
        type: Number,
        default: 0
    },
    images: [String],

    variants: [{
        sku: String,
        size: String,
        color: {
            name: String,
            code: String
        },
        mrp: {
            type: Number,
            require: true
        },
        sp:{
            type:Number,
            required:true
        },
        discount: {
            type: Number,
            default: 0
        },
        images:[String]
    }],
    quantity: {
        type: Number,
        required: true
    },

    ratting: {
        type: Number,
        default: 0
    },
    uploadedFrom: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved'],
        default: 'Pending'
    }
}, {
    timestamps: true
})


productSchema.index({"uploadedFrom":"2dsphere"});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;