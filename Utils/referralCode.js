const User = require('../Models/user.model');

async function generateReferralCode() {
    while (true) {
        const generatedReferralCode = generateRandomCode();
        const existingCode = await User.findOne({
            referralCode: generatedReferralCode
        });

        if (!existingCode) {
            return generatedReferralCode;
        }
    }
}

function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 12;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
}

module.exports = generateReferralCode ;

