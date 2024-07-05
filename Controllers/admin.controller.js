const sendMail = require('../Functions/sendMail');
const Banner = require('../Models/banner.model.js')
const walletController = require("./wallet.controller");
const orderController = require("./order.controller");

const Transaction = require("../Models/transactions.model");
const User = require("../Models/user.model");
const {
    PendingOrder,
    Order
} = require("../Models/order.model");
const {
    FashionProduct,
    GeneralProduct
} = require('../Models/product.model.js');
const Category = require('../Models/categories.model.js');


//actions on products pending products action is in product controller

//transaction actions 
const getAllTransactions = async (req, res) => {
    try {
        const {
            status
        } = req.query;
       
        let allTransactions = [];
        if (status == 'all') {
            allTransactions = await Transaction.find({});
        } else {
            allTransactions = await Transaction.find({
                status
            });
        }

        return res.send(allTransactions);
    } catch (err) {
        console.error('error in getting all transactions at admin controller', err);
        return res.status(500).send('something went wrong ! please try again')
    }
}
const approveTransaction = async (req, res) => {
    const {
        transactionId,
        status
    } = req.body;

    try {
        // if (!req.session.isAdmin) {
        //     return res.status(401).send('you are not allowed to perform this action.')
        // }
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(401).send('transaction not fount, try again');
        }
        if (transaction.status == 'approved') {
            return res.status(402).send('trasaction has already approved')
        }

        const userId = transaction.user;


        let updTransactionDoneFor;
        if (transaction.paidFor == 'topUp' && status == 'approve') {
            updTransactionDoneFor = await walletController.approveTopUp(userId, transaction.amount)

        } else if (transaction.paidFor == 'product') {
            updTransactionDoneFor = await orderController.updOrderPayment(transaction.paidForDetail, status)

        }

        if (!updTransactionDoneFor) {
            console.error('error in updating transaction status in', updTransactionDoneFor);
            return res.status(500).send('something went wrong ! try again');
        }

        if (status == 'decline') {
            await transaction.deleteOne();
            return res.send('transaction has been declined');
        }

        transaction.status = 'approved';
        await transaction.save();
        return res.send('transaction has been approved successfully !');

    } catch (error) {
        console.error('Error in approving payment in admin controller', error);
        return res.status(500).send('Internal Server Error ! try again');
    }
}

//category action
const addCategory = async (req, res) => {
    try {
        const {
            name,
            type,
            description,
            platformCharge
        } = req.body;
        const ifCategory = await Category.findOne({
            name
        });
        if (ifCategory) {
            return res.status(400).send({msg:'category already exists'})
        }

        const category = new Category({
            name,
            type,
            platformCharge,
            description
        })
        await category.save();

        return res.send({msg:'category added successfully'})
    } catch (err) {
        console.log('admin err', err)
        res.status(500).send({msg:'something went wrong try again !'})
    }
}

//actions on banner
const allBanner = async (req, res) => {
    try {
        const banners = await Banner.find({});

        return res.send({
            msg: 'fetched successfully',
            banners
        });

    } catch (err) {
        console.error('all banner err in admin.controller', err);
        return res.status(500).send({
            msg: 'internal server error ! please try later'
        })
    }
}
const addBanner = async (req, res) => {
    try {
        const {
            name,
            description
        } = req.body;
        const banner = new Banner({
            name,
            description,
            image: req.files
        })

        await banner.save();

        return res.send({
            msg: 'Banner added successfully',
            banner
        });
    } catch (err) {
        console.error('add banner err in admin.controller', err);
        return res.status(500).send({
            msg: 'internal server error ! please try later'
        })
    }
}

const adminController = {
    getAllUsers,
    getAllTransactions,
    getAllOrders,
    getFashionProducts,
    getGeneralProducts,
    getPendingOrders,
    approveTransaction,
    addCategory,
    allBanner,
    addBanner,
    searchUser,
    deleteUser
}

module.exports = adminController;