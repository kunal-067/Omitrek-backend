const { default: mongoose } = require("mongoose");

const bannerModel = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    addedAt:{
        type:Date,
        default:Date.now()
    }
})

const Banner = mongoose.model('banner', bannerModel);

module.exports = Banner;