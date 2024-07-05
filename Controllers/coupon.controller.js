const {
    promises
} = require('nodemailer/lib/xoauth2');
const {
    Coupon,
    CurrentCoupon
} = require('../Models/coupon.model');
const Transaction = require('../Models/transactions.model');
const User = require('../Models/user.model');
const {
    GeneratePrize
} = require('../Utils/generateScratchPrize');


function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Buy copuns
const buyCoupon = async (req, res) => {
    const {
        userId
    } = req.user;
    const {
        type,
        amount,
        couponRefrence
    } = req.body;
    try {
        const user = await User.findById(userId);
        const refRencedCoupon = await CurrentCoupon.findById(couponRefrence)
        if (!user) {
            return res.status(404).send({
                msg: `user doesn't exist ! please login again.`
            })
        }

        // else if(!refRencedCoupon){
        //     return res.status(404).send({msg:'invalid coupon ! try later'})
        // }

        if ((user.omniCoin + user.balance) < amount) {
            return res.status(402).send({
                msg: 'insufficient balance please toup !',
            })
        }

        let leftCost = 0;

        // console.log(user.balance)
        if (user.balance > amount) {
            user.balance -= amount
        } else {
            leftCost = (amount - user.balance)
            user.balance = 0;
        }

        user.omniCoin -= leftCost;
        user.balance2 += (amount * 1.3);

        if(user.omniCoin < 0){
            return res.status(400).send({msg:'Invalid attempt try later !'})
        }
        const referral = await User.findOne({
            referralCode: user.referredBy
        })
        let refwin;
        if (amount == 20) {
            refwin = getRandomNumber(1, 5)
        } else if (amount == 100) {
            refwin = getRandomNumber(20, 50)
        } else if (amount == 50) {
            refwin = getRandomNumber(40, 80)
        } else if (amount == 20) {
            refwin = getRandomNumber(60, 120)
        }
        if (referral) {
            referral.earning += refwin ;
            referral.balance += refwin;
            // referral.balance50 += refwin;
            referral.coupons.push({
                amount,
                win: refwin,
                type: 'time',
            })
            await referral.save();
        }

        if (refRencedCoupon?.type == 'count') {
            if (refRencedCoupon.count >= refRencedCoupon.limit) {
                return res.status(402).send({msg:'invalid attempt max limit reached.'})
            }
            refRencedCoupon.count++;
            await refRencedCoupon.save()
        }

        if (type == 'instant') {
            const win = await appendCoupon(userId, amount, type, user)
            return res.send({
                msg: `Congratulation you won ₹${win}`
            })
        }

        const coupon = new Coupon({
            user: userId,
            amount,
            type,
            couponRefrence: couponRefrence ? couponRefrence : ''
        })

        await Promise.all([user.save(), coupon.save()])

        return res.send({
            msg: `Coupon bought successfully`
        });

    } catch (err) {
        console.error('error in buying coupon at coupon controller', err);
        return res.status(500).send({
            msg: 'something went wrong ! try again.'
        })
    }

}

const userCoupons = async (req, res) => {
    try {
        const {
            userId
        } = req.user;
        const coupons = await Coupon.find({
            user: userId
        });

        return res.send({
            msg: 'successfull',
            coupons
        })
    } catch (err) {
        console.log('user coup err', err)
        return res.status(500).send({
            msg: 'internal server error try later'
        })
    }
}

//send current runnig coupons to user
const activeCoupons = async (req, res) => {
    try {
        const coupons = await CurrentCoupon.find({});
        return res.send({
            msg: 'successfull',
            coupons
        })
    } catch (err) {
        console.error('error in act coupon', err)
        return res.status(500).send({
            msg: 'internl server error'
        })
    }
}
//coupon history of users
const getCoupons = async (req, res) => {
    try {
        const {
            userId
        } = req.user;

        const user = await User.findById(userId);

        return res.send({
            msg: 'successfull',
            coupons: user.coupons
        })
    } catch (err) {
        console.error('error in getting coupon at coupon controller', err);
        return res.send({
            msg: 'something went wrong ! try again.'
        })
    }
}

//admin action on general coupons
const allCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});

        return res.send({
            msg: 'successfull',
            coupons
        })
    } catch (err) {
        console.error('error in all coup', err)
        return res.status(500).send({
            msg: 'internal server error try again'
        })
    }
}
const send60Coupon = async (req, res) => {
    try {
        const counpon60s = await Coupon.find({
            type: '60day'
        }).populate('user');
        counpon60s.forEach(coupon => {
            append60Coupon(coupon)
        })

        return res.send({
            msg: 'process started successfully'
        })
    } catch (err) {
        console.error('error in coup controller', err)
        return res.status(500).send({
            msg: 'internal server error try again'
        })
    }
}
const append60Coupon = async (coupon) => {
    try {
        if (coupon.type !== '60day' || coupon.count > 40) {
            return ({
                msg: 'invalid attempt either 60 days passes or invalid coupon'
            })
        }

        let win = getRandomNumber(2, 20);

        coupon.user.earning += (0.8 * win);
        coupon.user.balance += (0.8 * win);
        coupon.user.balance50 += (0.2 * win);
        coupon.user.coupons.push({
            amount: coupon.amount,
            type: 'scratch',
            win,
        })
        coupon.count += 1;
        await Promise.all([coupon.user.save(), coupon.save()]);

    } catch (err) {
        console.error('error in sending60Coup coupon at coupon controller', err);
    }
}

//admin action on timing coupons 
const appendCoupon = async (userId, amount, type, user, ) => {
    try {
        if (!user) {
            user = await User.findById(userId);
        }

        let win = GeneratePrize(user.balance, 'rew' + amount)

        user.coupons.push({
            type: type || 'time',
            amount,
            win,
        })

        user.earning += win ;
        user.balance += win ;
        // user.balance50 += (win * 0.2);
        await user.save();
        return win
    } catch (err) {
        console.error('error in appending coupon at coupon controller', err);
        throw new Error('error in appending coupon at coupon controller', err)
    }
};
const createTimingCoupon = async (name, amount, period) => {
    const deltCoupons = await CurrentCoupon.deleteMany({
        name: {
            $ne: name
        }
    });
    try {
        const coupon = CurrentCoupon({
            name,
            amount,
            period,
            createdAt: Date.now()
        })

        await coupon.save()

        setTimeout(() => {
            timeCouponClosing(coupon._id, name, amount, period)
        }, period * 60 * 1000);

    } catch (err) {
        console.error('coupon error', err);
    }
};
const timeCouponClosing = async (couponRefrence, name, amount, period) => {
    try {
        createTimingCoupon(name, amount, period)
        const coupon = await CurrentCoupon.findByIdAndDelete(couponRefrence);

        const coupons = await Coupon.find({
            couponRefrence
        });
        coupons.forEach(coupon => {
            appendCoupon(coupon.user, coupon.amount)
        })
    } catch (err) {
        console.error('closing error', err)
    }
};

const createCoupon = async (req, res) => {
    try {
        const {
            name,
            type,
            amount,
            period,
            limit
        } = req.body;

        console.log(req.body)
        const isCoup = await CurrentCoupon.findOne({
            name
        })

        if (isCoup) {
            return res.status(402).send({
                mag: 'Coupon this name already exists'
            })
        }

        const runCoupon = new CurrentCoupon({
            name,
            type,
            amount,
            limit: limit || '',
            period: period || '',
        })
        await runCoupon.save();
        return res.send({
            msg: 'coupon created successfully'
        })
    } catch (err) {
        console.error('error in coup controller', err)
        return res.status(500).send({
            msg: 'internal server error try again'
        })
    }
}
const closeCoupon = async (req, res) => {
    try {
        console.log('hello ji')
        const {
            couponRefrence,
            type
        } = req.body;
        const countCoupons = await Coupon.find({
            couponRefrence
        });

        console.log(countCoupons.length, type)
        for (const coupon of countCoupons) {
            appendCoupon(coupon.user, coupon.amount, coupon.type);
            await Coupon.findByIdAndDelete(coupon._id);
        }

        return res.send({
            msg: 'process started successfully'
        });
    } catch (err) {
        console.error('error in coup controller', err)
        return res.status(500).send({
            msg: 'internal server error try again'
        })
    }
}

const name = Date.now()
console.log(name, 'its a name of coupon')

// createTimingCoupon(name, 20, 1)
// createTimingCoupon(name, 100, 5)
// createTimingCoupon(name, 500, 5)
// createTimingCoupon(name, 1000, 5)
// createTimingCoupon(name, 20, 40)
// createTimingCoupon(name, 100, 40)
// createTimingCoupon(name, 500, 40)
// createTimingCoupon(name, 1000, 40)

const couponController = {
    allCoupons,
    activeCoupons,
    buyCoupon,
    getCoupons,
    send60Coupon,

    createCoupon,
    closeCoupon,
    userCoupons
}

module.exports = couponController;