const { Router } = require("express");
const userController = require("../Controllers/user.controller");
const { addReview } = require("../Controllers/review.controller");
const orderController = require("../Controllers/order.controller");
const cartController = require("../Controllers/cart.controller");
const walletController = require("../Controllers/wallet.controller");
const { checkUniqueName, registerShop } = require("../Controllers/shop.controller");

const router = Router();

//shop routes ---
router.post('/check-name', checkUniqueName);
//working
router.post('/register-shop', registerShop);

//user routes ---
router.put('/profile', userController.updateProfile);
router.patch('/password',userController.updatePassword);

//get user info get id from token
router.get('/user-info',userController.getUserInfo);
router.post('/log-out', userController.logout);
router.get('/referrals', userController.getReferrals)

//review  routes ---
router.post('/review', addReview);

//cart routes ---
router.get('/cart', cartController.getCart);
router.post('/cart', cartController.addToCart);
router.put('/cart', cartController.updateCart);
router.delete('/cart', cartController.removeFromCart);

//order routes ---
router.post('/order', orderController.buyProduct);
router.get('/orders', orderController.getUserOrders);
router.get('/order-info', orderController.getOrderInfo);
router.patch('/order', orderController.changeOrderStatus);

//wallet routes ---
router.post('/withdrawl', walletController.withdrawlRequest);
router.post('/topup', walletController.topUp);
router.post('/transaction-password', walletController.setTransactionPassword);
router.get('/withdrawls', walletController.getWithdrawls);
router.post('/send-money', walletController.sendMoney);


module.exports = router;

