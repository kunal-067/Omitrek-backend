const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: String,
    quantity: {
        type: Number,
        default: 1
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
});


const addressSchema = new mongoose.Schema({
    name: {type:String, required:true},
    phone:{
        type: Number,
        required: true
    },

    landMark:String,
    houseNo:String,
    street:String,
    city:String,
    state:String,
    pinCode:{type:Number,required:true},
    country: String,
    address:String,

    coordinate:[Number],
    isDefault:{
        type:Boolean,
        default:false
    }
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: String,
    addresses: [addressSchema],

    role: {
        type: String,
        enum: ['User', 'Seller', 'Admin', 'Affliate'],
        default: 'User'
    },
    userInfo: String,
    password: {
        type: String,
        required: true
    },
    transactionPassword: String,
    referredBy: String,
    referralCode: {
        type: String,
        required: true
    },
    shop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop"
    },

    omniCoin: {
        type: Number,
        default: 0
    },
    earning: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    balance2: {
        type: Number,
        default: 0
    },
    balance50: {
        type: Number,
        default: 0
    },
    
    receivedCoins:[{
        phone:Number,
        name: String,
        coins:Number,
        date:Date
    }],
    sentCoins:[{
        phone:Number,
        name: String,
        coins:Number,
        date:Date
    }],

    registrationDate: {
        type: Date,
        default: Date.now()
    },


    cart: [cartItemSchema],
});

const User = mongoose.model('User', userSchema);
module.exports = User;