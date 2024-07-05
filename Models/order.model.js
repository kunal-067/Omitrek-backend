const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    productType:{
        type:String,
        enum:['general','fashion'],
        default:'general'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productImage:String,
    productName:String,
    variant:String,
    
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    },

    payableAmount:{
        type: Number,
        default:0
    },
    totalPrice: {
        type: Number,
        default:0,
        required: true
    },
    couponApplied: [String],
    couponDiscount: {
        type: Number,
        default: 0
    },
    size: {
        type: String,
    },
    quantity: {
        type: Number,
    },

    paymentMode:String,
    shippingAddress: {
        street: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: Number,
    },

    orderStatus: {
        type: String,
        enum:['Processing','Shipped','Delivered','Returning','Returned','Cancelled','ReturnRejected'],
        default: "processing",
    },
    paymentStatus:{
        type:String,
        enum:['Paid','Unpaid'],
        default:'Unpaid'
    },
    paidAt:Date,
    deliveredAt: Date,
    cancelledAt: Date,
    shippedAt: Date,
    returnedAt: Date,
    returnRequestedAt: Date,
    returnRejectedAt: Date
},{
    timestamps:true
})

// const PendingOrder = mongoose.model('pendingOrder', orderSchema)
const Order = mongoose.model('Order', orderSchema)

module.exports = Order ;
