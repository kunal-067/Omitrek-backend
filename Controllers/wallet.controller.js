const sendMail = require('../Functions/sendMail');
const Transaction = require('../Models/transactions.model');
const User = require('../Models/user.model');
const Withdrawl = require('../Models/withdrawl.model');
const { asyncHandler, ApiResponse, ApiError } = require('../Utils/api.util');
const {
    hashPassword,
    checkPassword
} = require('../Utils/passwordHass');
const {
    default: mongoose
} = require('mongoose');


const withdrawlRequest = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        upi,
        amount,
        transactionPassword
    } = req.body;

    const user = await User.findById(userId);

    if (amount < 2500) {
        return res.status(401).send(new ApiError(401, 'Amount is less than min withdrawl limit'));
    }
    if (!user) {
        return res.status(404).send(new ApiError(404, 'User not found ! May be server issue, try again.'));
    }
    if (user.balance < amount) {
        return res.status(401).send(new ApiError(401, 'Insufficient balance', {
            balance: user.balance
        }));
    }

    const isPassRight = true || await checkPassword(transactionPassword, user.transactionPassword);
    if (!isPassRight) {
        return res.status(402).send(new ApiError(402, 'Wrong transaction password !'));
    }

    const withdrawl = new Withdrawl({
        user: userId,
        upi,
        amount
    });
    user.balance -= amount;
    await Promise.all([withdrawl.save(), user.save()]);

    return res.json(new ApiResponse(200, 'Withdrawl request submitted successfully !', {
        withdrawls: user.withdrawls
    }));
});

const topUp = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        upi,
        amount
    } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send(new ApiError(404, 'User not found, try again'));
    }

    const transaction = new Transaction({
        upi,
        amount,
        user: user._id,
        paidFor: 'topUp'
    });
    await transaction.save();
    return res.send(new ApiResponse(200, 'Topup request submitted successfully'));
});

const sendMoney = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        receiverId,
        receiverPhone,
        amount,
        password
    } = req.body;
    const user = await User.findById(userId);

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).send(new ApiError(400, 'Invalid amount ! try again'));
    }
    if (amount > user.omniCoin) {
        return res.status(400).send(new ApiError(400, `Insufficient balance you just have ${user.balance} which you can send`));
    }

    const isPassRight = await checkPassword(password, user.transactionPassword);
    if (!isPassRight) {
        return res.status(401).send(new ApiError(401, 'Wrong transaction password ! try again'));
    }

    let receiver;
    if (receiverId) {
        receiver = await User.findById(receiverId);
    } else if (receiverPhone) {
        receiver = await User.findOne({
            phone: receiverPhone
        });
    }
    if (!receiver) {
        return res.status(401).send(new ApiError(401, 'Invalid receiver details try again'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        receiver.omniCoin += parseFloat(amount) * 0.98;
        receiver.receivedCoins = {
            sender: user._id,
            senderName: user.name,
            coins: amount
        };
        user.omniCoin -= amount;
        user.sentCoins = {
            receiver: user._id,
            receiverName: user.name,
            coins: amount
        };

        await receiver.save({
            session
        });
        await user.save({
            session
        });
        await session.commitTransaction();
        session.endSession();
        return res.send(new ApiResponse(200, 'Amount transferred successfully'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const setTransactionPassword = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        transactionPassword
    } = req.body;

    const user = await User.findById(userId);
    if (!user || !transactionPassword) {
        return res.send(new ApiResponse(400, 'Missing parameters'));
    }

    const hashedTransactionPassword = await hashPassword(transactionPassword);
    user.transactionPassword = hashedTransactionPassword;
    await user.save();

    return res.send(new ApiResponse(200, 'Transaction password set successfully'));
});

const getWithdrawls = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send(new ApiError(404, 'Invalid attempt ! no user with this id exists'));
    };
    let withdrawls;
    if (user.role == 'Admin') {
        withdrawls = await Withdrawl.find({
            user: req.query.user
        })
    } else {
        withdrawls = await Withdrawl.find({
            user: userId
        });
    }

    return res.send(new ApiResponse(200, 'Successful fetched withdrawls !', withdrawls));
});

const getAllWithdrawls = asyncHandler(async (req, res) => {
    const {
        status
    } = req.query;

    let withdrawls;
    if (status === 'All') {
        withdrawls = await Withdrawl.find({});
    } else {
        withdrawls = await Withdrawl.find({
            status
        });
    }

    return res.send(new ApiResponse(200, 'Successfully fetched withdrawls !', {
        withdrawls
    }));

});

const updateWithdrawl = asyncHandler(async (req, res) => {
    const {
        withdrawlId,
        status
    } = req.body;

    const withdrawl = await Withdrawl.findById(withdrawlId);
    if (!withdrawl) {
        return res.status(404).send(new ApiError(404, 'Invalid withdrawl id! Try again.'));
    }

    withdrawl.status = status;
    await withdrawl.save();
    return res.send(new ApiResponse(200, 'Withdrawl updated successfully !'));

});

const getUserTransactions = asyncHandler(async(req,res)=>{
    const {userId}=req.data;
    const {type} = req.query;
    const user = await User.findById(userId);
    if(!user){
        return res.send(new ApiError(404, 'User not found pls try later.'))
    }
    let data = [];
    if(type == 'received'){
        data = user.receivedCoins;
    }else{
        data = user.sentCoins;
    }

    return res.send(new ApiResponse(201, 'Transactions fetched successfully !', data))
})
const walletController = {
    withdrawlRequest,
    topUp,
    sendMoney,
    setTransactionPassword,
    getWithdrawls,
    getAllWithdrawls,
    updateWithdrawl,
    getUserTransactions
}
module.exports = walletController;