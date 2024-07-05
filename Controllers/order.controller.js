const Order = require("../Models/order.model");
const Transaction = require("../Models/transactions.model");
const User = require('../Models/user.model');

const {
  asyncHandler,
  ApiResponse,
  ApiError
} = require("../Utils/api.util");
const Product = require("../Models/product.model");

//send a detailed info of order even if user or admin or seller
const getOrderInfo = asyncHandler(async (req, res) => {
  const {
    userId,
    shopId
  } = req.data;

  const orderId = req.query.id;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).send(
      new ApiError(404, 'Order not found ! try again.')
    )
  }

  if (!order.user.equals(userId) && !order.shop.equals(shopId)) {
    return res.status(401).send(
      new ApiError(401, 'Invalid access ! sorry but it seems this is not your order.')
    )
  }

  return res.send(
    new ApiResponse('Successfully ! getorder information.', order)
  )
});

//change status of prod order by seller
const approveOrderStatus = asyncHandler(async (req, res) => {
  const {
    shopId
  } = req.data;

  const {
    orderId,
    status
  } = req.body;

  if (status == 'Delivered') {
    return res.status(400).send(new ApiError(400, 'invalid action ! order already delivered.'))
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(401).send(new ApiError(401, 'invalid order!'))
  }

  if (!order.shop.equals(shopId)) {
    return res.status(401).send(new ApiError(401, 'invalid attempt the order is not in your list !'))
  }

  order.orderStatus = status;

  if (orderStatus == "Delivered") {
    order.deliveredAt = Date.now();
  } else if (orderStatus == "Shipped") {
    order.shippedAt = Date.now()
  } else if (orderStatus == "Cancelled") {
    order.cancelledAt = Date.now()
  }else if (orderStatus == "Returned") {
    order.returnedAt = Date.now()
  }else if(orderStatus == "ReturnRejected"){
    order.returnRejectedAt = Date.now()
  }

  await order.save();
  return res(202).send(
    new ApiResponse(202, `Order status changed to ${status} successfully`, order)
  )
});

//change by user
const changeOrderStatus = asyncHandler(async (req, res) => {
  const {
    userId
  } = req.data;

  const {
    orderId,
    status
  } = req.body;

  const order = await Order.findById(orderId);

  const returnPeriod = 7*24*60*60*10
  if (!order) {
    return res.status(401).send(new ApiError(401, 'invalid order!'))
  }
  if (!order.shop.equals(userId)) {
    return res.status(401).send(new ApiError(401, 'invalid attempt the order is not in your list !'))
  }
  if(order.deliveredAt && (order.deliveredAt+returnPeriod < Date.now())){
    return res.status(400).send(new ApiError(400, "Returning period over !"))
  }

  const usersAct = ['Returning', 'Cancelled']
  if( !usersAct.some(orderStatus) ){
    return res.status(400).send(new ApiError(400, "Invalid attempt ! try again."))
  }
  order.orderStatus = status;

  if (orderStatus == "Canelled") {
    order.deliveredAt = Date.now();
  }else if(orderStatus == "Returning"){
    order.returnRequestedAt = Date.now()
  }

  await order.save();
  return res(202).send(
    new ApiResponse(202, `Order status changed to ${status} successfully`, order)
  )
});

const buyProduct = asyncHandler(async (req, res) => {
  const {
    userId
  } = req.user;
  let {
    phone,
    productId,
    quantity,
    size,
    discount50,
    discount2,
    balance,
    shippingAddress,
    variant,
    coordinates,
    upi,
    paymentMode,
  } = req.body;
  const [user, product] = await Promise.all([User.findById(userId), Product.findById(productId).populate('category', 'discount2')]);

  if (!user || !product) {
    return res.status(402).send(new ApiError(402, "Invalid attempt ! product or user missing."));
  }
  let price = product.sp
  let varProd;
  if (variant) {
    varProd = product.variants.find(prod => prod._id.equals(variant));
    price = varProd.sp
  }

  const payableAmount = price * quantity;
  let discount = 0;
  //for giving 2 % coupon discount
  if (discount2) {
    const minus2 = ((product.category?.discount2 || 2) * payableAmount) / 100;
    if (minus2 < user.balance2) {
      discount += minus2;
    } else {
      discount += user.balance2;
    }
  }
  //for giving 50 % coupon discount
  if (discount50) {
    const minus50 = (50 * payableAmount) / 100;
    if (minus50 < user.balance50) {
      discount += minus50;
    } else {
      discount += user.balance50;
    }
  }
  //for buying from topup balance
  if (balance) {
    if (payableAmount < user.balance) {
      discount += payableAmount;
    } else {
      discount += user.balance;
    }
  }

  let transaction;

  paymentMode == "online" ?
    (transaction = new Transaction({
      user: user._id,
      paidFor: "product",
      upi,
      amount: payableAmount,
    })) :
    undefined;

  const order = new Order({
    user: userId,
    shop: shopId,
    product: productId,
    productName: product.name || null,
    productImage: varProd?.images[0] || product.images[0],
    variant,
    userName: user.name,
    phone: phone || user.phone,
    totalPrice: (varProd?.mrp || product.mrp) * quantity,
    payableAmount: payableAmount - discount,
    paymentStatus: payableAmount == 0 ? "Paid" : "Unpaid",
    paymentMode,
    shippingAddress,
    transaction: paymentMode == "online" ? transaction._id : undefined,
    quantity,
    size,
  });

  if (paymentMode == "online") {
    transaction.paidForDetail = order._id;
    await transaction.save();
  }

  await order.save();
  return res.json(
    new ApiResponse(200, 'Order placed successfully !', order)
  );
});


//admin action
const updOrderPayment = asyncHandler(async (orderId, status) => {
  try {
    const order = await PendingOrder.findById(orderId);
    if (!order) {
      return res.send('order not found try again !')
    }

    if (status == 'Decline') {
      await order.deleteOne();
      return ({
        msg: 'Order deleted successfully',
        status: true
      })
    }

    order.paymentStatus = 'Paid';
    order.paidAt = Date.now();

    await order.save()

    return ({
      msg: 'Order updated successfully',
      status: true
    })
  } catch (err) {
    throw err
  }
});

const getUserOrders = asyncHandler(async (req, res) => {
  const {
    userId
  } = req.data;
  const {
    limit,
    page,
    status
  } = req.query;
  let orders;
  if (status) {
    orders = Order.find({
      user: userId,
      status
    }).skip((page || 0) * (limit || 10)).limit(limit || 10)

  } else {
    orders = Order.find({
      user: userId
    }).skip((page || 0) * (limit || 10)).limit(limit || 10)

  }

  return res.send(ApiResponse(200, 'Successfully fetched orders !', orders));

});

const getShopOrders = asyncHandler(async (req, res) => {
  const {
    shopId
  } = req.shop;
  const {
    page,
    limit,
    status
  } = req.query;

  let orders;
  if (status) {
    orders = await Order.find({
      shop: shopId,
      orderStatus: status
    }).skip((page || 0) * (limit || 20)).limit(limit || 20);
  } else {
    orders = await Order.find({
      shop: shopId
    }).skip((page || 0) * (limit || 20)).limit(limit || 20);
  }

  return res.send(new ApiResponse(200, 'Successfully fetched orders of the shop.', orders));

});


const orderController = {
  getOrderInfo,
  getUserOrders,
  getShopOrders,
  approveOrderStatus,
  changeOrderStatus,
  buyProduct
}

module.exports = orderController;