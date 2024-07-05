const User = require('../Models/user');
const cron = require('node-cron');
const schedule = require('node-schedule');


async function updRefIncome(data, couponWorth) {
    try {
        const userIdToFind = data._id;
        // Find all users who contain the referral
        const userReferrals = await User.find({
            'referrals._id': userIdToFind
        });
        for (const user of userReferrals) {
            if (hasCouponsWorthMore(user, couponWorth)) {
                const refIndex = user.referrals.findIndex(referral => referral._id == userIdToFind);
                const level = user.referrals[refIndex].level;

                // Calculate earnings based on referral level
                const earningPercentage = await getEarningPercentage(level);
                user.earning = user.earning + couponWorth * earningPercentage / 100 || 0;

                // Save each user individually
                await user.save();
            }
        }
    } catch (err) {
        throw err;
    }
}

async function upd50income(coupPurchasor, couponWorth) {
    const user = await User.findOne({
        referrals: {
            $elemMatch: {
                _id: coupPurchasor,
                level: 1,
            },
        },
    });
    const coupons = user.coupons;
    if (coupons.length !== 0) {
        let biggerCoupon = coupons.reduce((acrr, curr) => {
            if (acrr.amount < curr.amount) {
                return curr;
            } else {
                return acrr;
            }
        }, coupons[0])
        if (biggerCoupon.amount == couponWorth) {
            if (user.count50 < 5) {
                user.count50 += 1;
                await user.save()
            } else {
                user.count50 = 1;

                // Schedule for the next 3 months
                for (let i = 0; i < 3; i++) {
                    const currentDate = new Date();
                    const rule = new schedule.RecurrenceRule();
                    rule.date = currentDate.getDate(); // Run on the current day
                    rule.month = currentDate.getMonth() + i;

                    schedule.scheduleJob(rule, async () => {
                        user.balance50 += increaseBy;
                        await user.save();
                    });
                }
            }
        }
    }
}

function getEarningPercentage(level) {
    const percentageMap = {
        1: 10,
        2: 5,
        3: 3,
        4: 2,
        5: 1
    };
    return percentageMap[level] || 0;
}

function hasCouponsWorthMore(user, couponWorth) {
    if (user && user.coupons && user.coupons.length > 0) {
        // Check if any coupon is worth more than couponWorth
        return user.coupons.some(coupon => coupon.amount >= couponWorth && coupon.status == 'approved');
    }
    return false;
}


async function forUpdatingCv(userId, longTreeData, purchaseAmount, longTreeDataUser) {
    console.log('updating')
    if (userId !== longTreeDataUser._id) {
        const userIndex = longTreeData.findIndex(elem => elem.user.equals(userId));
        if(userIndex !== -1){
        const userIdToUpdCv = longTreeData[userIndex].upMember;
        const userToUpdCv = await User.findById(userIdToUpdCv);
        if (longTreeData[userIndex].position == 'right') {
            userToUpdCv.rightCv += Math.floor(purchaseAmount / 500)
            if (userToUpdCv.rightCv >= 1200 && userToUpdCv.leftCv >= 1200) {
                userToUpdCv.cvCycle += 1
                let currentCycle = userToUpdCv.currentCycle;
                currentCycle += 1
                userToUpdCv.rightCv -= 1200
                userToUpdCv.leftCv -= 1200
            }
        } else if (longTreeData[userIndex].position == 'left') {
            userToUpdCv.leftCv += Math.floor(purchaseAmount / 500)
            if (userToUpdCv.rightCv >= 1200 && userToUpdCv.leftCv >= 1200) {
                userIdToUpdCv.cvCycle += 1
                userIdToUpdCv.currentCycle += 1
                userToUpdCv.rightCv -= 1200
                userToUpdCv.leftCv -= 1200
            }
        }
        userToUpdCv.save()

        forUpdatingCv(userIdToUpdCv, longTreeData, purchaseAmount, longTreeDataUser)
    }
    }
}

function checkRefRanks(rank, array, level) {
    let refsRank = array.filter(elem => {
        elem.rank = rank
        if (level) {
            elem.level = level
        }
    })
}



async function closingFunction() {
    const users = await User.find({})
    users.reverse()
    users.forEach(user => {
        if (user.earning >= 1000000000 && user.rank < 12) {
            increaseHigherRank(12, user, 7, 12000000)
        } if (user.earning >= 400000000 && user.rank < 11) {
            increaseHigherRank(11, user, 2, 8000000)
        } if (user.earning >= 200000000 && user.rank < 10) {
            increaseHigherRank(10, user, 4, 6000000)
        } if (user.earning >= 100000000 && user.rank < 9) {
            increaseHigherRank(9, user, 3, 4000000)
        } if (user.earning >= 8000000 && user.rank < 8) {
            increaseHigherRank(8, user, 6, 2000000)
        } if (user.earning >= 5000000 && user.rank < 7) {
            increaseHigherRank(7, user, 3, 1000000)
        } if (user.earning >= 2500000 && user.rank < 6) {
            increaseHigherRank(6, user, 3, 400000)
        } if (user.earning >= 1000000 && user.rank < 5) {
            increaseHigherRank(5, user, 3, 200000)
        } if (user.earning >= 200000 && user.rank < 4) {
            increaseHigherRank(4, user, 2, 80000)
        } if (user.currentCycle >= 10 && user.rank < 3) {
            increaseRank(3, user)
        } if (user.currentCycle >= 4 && user.rank < 2) {
            increaseRank(2, user)
        } if (user.cvCycle >= 1 && user.rank < 1) {
            increaseRank(1, user)
        }
        increaseCvIncome(user, user.rank)
        user.save()
    })
}

function increaseCvIncome(user, rank) {
    let earnLimit = 0;
    if (rank == 12) {
        earnLimit = 12000000
    } else if (rank == 11) {
        earnLimit = 8000000
    } else if (rank == 10) {
        earnLimit = 6000000
    } else if (rank == 9) {
        earnLimit = 4000000
    } else if (rank == 8) {
        earnLimit = 2000000
    } else if (rank == 7) {
        earnLimit = 1000000
    } else if (rank == 6) {
        earnLimit = 400000
    } else if (rank == 5) {
        earnLimit = 200000
    } else {
        earnLimit = 80000
    }


    let increaseCvIncomeBy = user.currentCycle * 12000
    if (increaseCvIncomeBy > earnLimit) {
        increaseCvIncome = earnLimit
    }
    user.earning += increaseCvIncomeBy
    user.balance += 0.8 * increaseCvIncomeBy
    user.balance50 += 0.2 * increaseCvIncomeBy
    user.currentCycle = 0
}

async function increaseHigherRank(rank, user, refLen, earnLimit) {
    const checkRanks = user.treeData.filter(elem => elem.rank >= rank - 1)
    const userIdToUpdCv = user._id
    if (checkRanks.length >= 2 * refLen) {
        const checkLeft = checkRanks.filter(elem => elem.position == 'left');
        const checkRight = checkRanks.filter(elem => elem.position == 'right')
        if (checkLeft == refLen && checkRight == refLen) {
            user.rank = rank
            User.updateMany({
                'referrals._id': userIdToUpdCv
            }, {
                $set: {
                    'rank': rank
                }
            });
            User.updateMany({
                'treeData.user': userIdToUpdCv
            }, {
                $set: {
                    'rank': rank
                }
            });
            let increaseCvIncomeBy = 12000 * user.currentCycle
            if (increaseCvIncomeBy > earnLimit) {
                increaseCvIncomeBy = earnLimit
            }
            // user.earning += increaseCvIncomeBy
            // user.balance += 0.8 * increaseCvIncomeBy
            // user.balance50 += 0.2 * increaseCvIncomeBy
            // user.currentCycle = 0
        }

    }
}

async function increaseRank(rank, user) {
    const checkRanks = user.referrals.filter(elem => elem.rank >= rank - 1 && elem.level == 1)
    const userIdToUpdCv = user._id
    if (checkRanks.length >= 2) {
        const checkLeft = checkRanks.find(elem => elem.position == 'left');
        const checkRight = checkRanks.find(elem => elem.position == 'right')
        if (checkLeft && checkRight) {
            user.rank = rank
            User.updateMany({
                'referrals._id': userIdToUpdCv
            }, {
                $set: {
                    'rank': rank
                }
            });
            User.updateMany({
                'treeData.user': userIdToUpdCv
            }, {
                $set: {
                    'rank': rank
                }
            });
            let increaseCvIncomeBy = 12000 * user.currentCycle
            if (increaseCvIncomeBy > 80000) {
                increaseCvIncomeBy = 80000
            }
            user.earning += 0.8 * increaseCvIncomeBy
            user.balance += 0.8 * increaseCvIncomeBy
            user.balance50 += 0.2 * increaseCvIncomeBy
            user.currentCycle = 0
        }

    }
}



// Cron job to run every Sunday at midnight (0:0)
cron.schedule('0 0 * * 0', async () => {
    try {
        closingFunction()
        console.log('Field updated to zero on Sunday.');
    } catch (error) {
        console.error('Error updating field:', error);
    }
});

// Keep the script running
process.stdin.resume();


module.exports = {
    updRefIncome,
    upd50income,
    forUpdatingCv
}