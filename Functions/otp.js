const fast2sms = require('fast-two-sms');
// In-memory cache for storing OTPs and timestamps
const otpCache = {};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function sendOTP(phoneNumber) {
    const otp = generateOTP();
    const options = {
        authorization: 'Go6NclO5uh3gfTeHr8YyxFzbBQnPWj70CtRksX4EUvM2V1awIDjUzZnTku37dMaP4CAtGvB8yYglx6qc',
        message: otp,
        numbers: [phoneNumber]
    };
    otpCache[phoneNumber] = {
        otp: otp,
        timestamp: Date.now()
    };
    try {
        // const res = await fast2sms.sendMessage(options);
        console.log('OTP sent successfully:', otp);
        // console.log(otp)
        return otp;
    } catch (err) {
        console.error('Error sending OTP:', err);
        throw new Error('Failed to send OTP. Please try again.');
    }
}
function verifyOTP(phoneNumber, userEnteredOTP) {
    // Check if OTP exists in the cache
    const cachedOTP = otpCache[phoneNumber];
    if (cachedOTP && cachedOTP.otp == userEnteredOTP) {
        // Check if the OTP is still valid (within a 2-minute window) //
        const currentTime = Date.now();
        const timeDifference = currentTime - cachedOTP.timestamp;
        if (timeDifference <= 2 * 60000) {
            // console.log('OTP verified successfully!');
            delete otpCache[phoneNumber];
            return true;
        } else {
            // console.log('OTP has expired.');
            delete otpCache[phoneNumber];
            return 'expireOtp';
        }
    } else {
        // console.log('Invalid OTP.');
        return false;
    }
}

module.exports={sendOTP,verifyOTP}