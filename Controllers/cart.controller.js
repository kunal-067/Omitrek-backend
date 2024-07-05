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
    const user = await User.finbyId(userId);
    if (!user) {
        res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }

    return res.status(200).send(
        new ApiResponse(200, "Cart fetched successfully !", user.cart)
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
    const [user, product] = await Promise.all([User.findbyId(userId), product.findbyId(productId)]);

    if (!user) {
        res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    };
    if (!product) {
        res.status(404).send(new ApiError(404, "Invalid Product Id ! please try later", '', ''));
    }

    user.cart.push({
        product: productId,
        quantity,
        size
    })

    await user.save();
    return res.status(200).send(new ApiResponse(200, "Product added to cart successfully !", ''))
});

const updateCart = asyncHandler(async (req, res) => {
    const {
        userId
    } = res.data;
    const {
        itemId,
        quantity,
        size
    } = req.body;
    const user = await User.findbyId(userId);
    if (!user) {
        res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }
    const cart = user.cart;
    const cartItem = cart.find(item => item._id.equals(itemId));
    cartItem.quantity = quantity;
    cartItem.size = size;
    await user.save();
    return res.status(201).send(new ApiResponse(201, "Cart updated successfully !", ''))
});

const removeFromCart = asyncHandler(async (req, res) => {
    const {
        userId
    } = res.data;
    const {
        itemId
    } = req.body;
    const user = await User.findbyId(userId);
    if (!user) {
        res.status(404).send(new ApiError(404, "User not found ! please try later", '', ''));
    }
    const cart = user.cart;
    const itemIndex = cart.findIndex(item => item._id.equals(itemId));
    cart.splice(itemIndex, 1);

    return res.status(204).send(new ApiResponse(204, 'Item removed from the cart successfully !', ''));
});

const cartController = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart
}

module.exports = cartController;