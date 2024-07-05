const { default: mongoose } = require("mongoose");

const couponSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    amount:Number,
    type:{
        enum:['time','60day','count','closing'],
        type:String,
        default:'time'
    },
    couponRefrence:String,
    status:{
        type:String
    },
    period:{
        type:Number,
        default:0
    },  
    count:{
        type:Number,
        default:0
    },
    sold:{
        type:Number,
        default:0
    },

    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const currCouponSchema = new mongoose.Schema({
    name:String,
    amount:Number,
    type:{
        enum:['time','60day','count','closing'],
        type:String,
        default:'time'
    },
    period:Number,
    limit:Number,
    count:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:['running', 'clossed'],
        default:'running'
    },
    createdAt:{
        type:Number,
        default:Date.now()
    }
})

const CurrentCoupon = mongoose.model('currentcoupon', currCouponSchema)

const Coupon = mongoose.model('coupon', couponSchema);
module.exports = {Coupon,CurrentCoupon};
