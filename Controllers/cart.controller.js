const Product = require("../Models/product.model");
const User = require("../Models/user.model");
const {
    asyncHandler,
    ApiError,
    ApiResponse
} = require("../Utils/api.util");

const getCart = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    console.log(userId)
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }

    console.log(user)
    return res.status(200).send(
        new ApiResponse(200, "Cart fetched successfully !", user?.cart)
    )
});

const addToCart = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        productId,
        quantity,
        size
    } = req.body;
    const [user, product] = await Promise.all([User.findById(userId), Product.findById(productId)]);

    if (!user) {
        return res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    };
    if (!product) {
        return res.status(404).send(new ApiError(404, "Invalid Product Id ! please try later", '', ''));
    }

    user.cart.push({
        product: productId,
        quantity,
        size
    })

    await user.save();
    return res.status(200).send(new ApiResponse(200, "Product added to cart successfully !", user.cart[user.cart.length-1]))
});

const updateCart = asyncHandler(async (req, res) => {
    // console.log(r)
    const {
        userId
    } = req.data;
    const {
        itemId,
        quantity,
        size
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }
    const cart = user.cart;
    const cartItem = cart.find(item => item._id.equals(itemId));
    cartItem.quantity = quantity;
    cartItem.size = size;
    await user.save();
    return res.status(201).send(new ApiResponse(201, "Cart updated successfully !", cartItem))
});

const removeFromCart = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        itemId
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }
    const cart = user.cart;
    const itemIndex = cart.findIndex(item => item._id.equals(itemId));

    if (itemIndex==-1) {
        return res.status(404).send(new ApiError(404, "Cart item not found ! please try later", '', ''));
    }
    const removedItem = cart.splice(itemIndex, 1);

    await user.save();

    return res.status(200).send(new ApiResponse(204, 'Item removed from the cart successfully !', removedItem));
});

const cartController = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart
}

module.exports = cartController;