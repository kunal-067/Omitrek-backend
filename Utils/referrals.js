const User = require("../Models/user.model")

const appendReferral = async (user, referralCode) => {
    try{
        const referral = await User.findOne({referralCode});
        referral.referrals.push(user._id);
        return true;
    }catch(err){
        throw new Error('referral appending err', err)
    }
}