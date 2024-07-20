const Shop = require("../Models/shop.model");
const User = require("../Models/user.model");
const {
    FashionProduct,
    GeneralProduct
} = require("../Models/product.model");

const {
    generateToken
} = require("../Utils/jwt.utils");
const {
    default: mongoose,
    Schema
} = require("mongoose");
const {
    ApiError,
    asyncHandler,
    ApiResponse
} = require("../Utils/api.util");
const Product = require("../Models/product.model");


const checkUniqueName = asyncHandler(async (req, res) => {
    const {
        uniqueName
    } = req.body;
    const isUniqueName = await Shop.findOne({
        uniqueName
    });

    if (isUniqueName) {
        return res.send(new ApiResponse(200, 'Shop ID already taken', {
            status: false
        }));
    }

    return res.send(new ApiResponse(200, 'Shop ID looks pretty impressive', {
        status: true
    }));
});

const registerShop = asyncHandler(async (req, res) => {
    const ownerId = req.data.userId;
    const {
        uniqueName,
        name,
        phone,
        email,
        GST,
        location,
        address
    } = req.body;
    const [isUniqueName, isShopExist, owner] = await Promise.all([
        Shop.findOne({
            uniqueName
        }),
        Shop.findOne({
            owner: ownerId
        }),
        User.findById(ownerId)
    ]);

    if (!owner) {
        return res.status(400).send(new ApiError(400, "Invalid attempt ! please register first."));
    }
    if (isUniqueName) {
        return res.status(400).send(new ApiError(400, 'The shop ID has already been taken. Please try another one.'));
    }
    if (isShopExist) {
        return res.status(400).send(new ApiError(400, 'Your shop has already been created'));
    }

    const shop = new Shop({
        uniqueName,
        name,
        phone,
        email,
        GST,
        owner,
        location,
        address
    });
    owner.role = 'Seller';
    owner.shop = shop._id;

    await Promise.all([owner.save(), shop.save()]);
    const {
        token,
        expiresAt
    } = generateToken({
        shopId: shop._id,
        userId: owner._id,
        role: owner.role,
        name: owner.name
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none'
    });

    return res.send(new ApiResponse(200, 'Shop registered successfully !', {
        user: {
            name: owner.name,
            role: 'Seller'
        },
        token,
        expiresAt
    }));
});

const editShop = asyncHandler(async (req, res) => {
    const {
        shopId
    } = req.data;
    const {
        modifiedData
    } = req.body;

    const shop = await Shop.findByIdAndUpdate(shopId, modifiedData, {
        new: true
    })

    return res.send(new ApiResponse(200, 'Shop updated successfully !', shop));
});

const getShops = asyncHandler(async (req, res) => {
    let {
        size,
        coordinates,
        page
    } = req.query;
    let role = 'User';
    if (req.data) {
        role = req.data;
    }

    page = parseInt(page);
    size = parseInt(size);
    let shops;
    if (role == 'Admin') {
        shops = await Shop.find({}).skip((page || 0) * (size || 20)).limit(size || 20)
    } else if (coordinates) {
        shops = await Shop.aggregate([{
            $geoNear: {
                near: {
                    key: 'Point',
                    coordinates: coordinates.split(',').map(Number)
                },
                query: {
                    status: 'Pending'
                },
                key: 'location',
                distanceMultiplier: 6371,
                distanceField: 'distance',
                spherical: true
            }
        }, {
            $project: {
                name: 1,
                address: 1,
                distance: 1,
                description: 1,
            }
        }]).limit(size || 10);
    } else {
        shops = await Shop.aggregate([{
            $match: {
                status: 'Approved'
            }
        }, {
            $sample: {
                size: size || 10
            }
        }]);
    }

    return res.send(new ApiResponse(200, 'Successful fetched shops', {
        shops
    }));
});

const getShopInfo = asyncHandler(async (req, res) => {
    const uniqueName = req.params.id;

    const shop = await Shop.findOne({
        uniqueName
    }, {
        GST: 0,
        createdAt: 0
    });

    if (!shop) {
        return res.status(404).send(
            new ApiError(404, 'Invalid shop id ! try again.')
        )
    }
    if (shop.status != 'Approved') {
        return res.status(403).send(
            new ApiError(403, 'The shop is not approved by admin yet !')
        )
    }

    return res.send(new ApiResponse(200, 'Successfully fetched shop info.', shop));
});


const getShopInfoBySeller = asyncHandler(async (req, res) => {
    const {
        shopId
    } = req.data;

    const shop= await Shop.findById(shopId);

    if (!shop) {
        return res.status(404).send(
            new ApiError(404, 'Invalid shop id ! try again.')
        )
    }
    if (shop.status != 'Approved') {
        return res.status(403).send(
            new ApiError(403, 'The shop is not approved by admin yet !')
        )
    }

    return res.send(new ApiResponse(200, 'Successfully fetched shop info.', shop));
});


const searchShop = asyncHandler(async (req, res) => {
    const searchedKey = req.query.key;
    let {
        page,
        size
    } = req.query;

    page = parseInt(page);
    size = parseInt(size);
    const shops = await Shop.find({
        $text: {
            $search: searchedKey
        }
    }, {
        _id: 1,
        uniqueName: 1,
        name: 1,
        shopImage: 1
    }).skip((page || 0) * (size || 15)).limit(size || 15);

    return res.send(new ApiResponse(200, 'shops searched successfully', {
        shops
    }));
});

const searchProductInShop = asyncHandler(async (req, res) => {
    const {
        key,
        shop
    } = req.query;

    const products = Product.aggregate([{
            $match: {
                "shop": shop
            }
        },
        {
            $text: {
                $search: key
            }
        },
        {
            $sample: {
                size: size || 10
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                price: 1,
                quantity: 1
            }
        }
    ])

    return res.send(new ApiResponse(200, 'Successful', products));
});

const getShopProducts = asyncHandler(async (req, res) => {
    const {
        shopId
    } = req.data;
    let {
        size,
        page
    } = req.query;

    size = parseInt(size);
    page = parseInt(page);
    const [fashionProducts, generalProducts] = await Promise.all([
        FashionProduct.find({
            shop: shopId
        }, {
            _id: 1,
            name: 1,
            category: 1,
            price: 1,
            discount: 1,
            quantity: 1,
            type: 'Fashion',
            image: {
                $arrayElemAt: ['$images', 0]
            }
        }).skip((page || 0) * (size || 10)).limit(size || 10),

        GeneralProduct.aggregate([{
                $match: {
                    shops: {
                        $elemMatch: {
                            shop: new Schema.Types.ObjectId(shopId)
                        }
                    }
                }
            },
            {
                $project: {
                    shop: {
                        $arrayElemAt: [{
                            $filter: {
                                input: "$shops",
                                as: "shop",
                                cond: {
                                    $eq: ["$$shop.shop", new Schema.Types.ObjectId(shopId)]
                                }
                            }
                        }, 0]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    category: 1,
                    price: '$shop.price',
                    discount: '$shop.discount',
                    quantity: '$shop.quantity',
                    type: 'General',
                    image: {
                        $arrayElemAt: ["$images", 0]
                    },
                }
            }
        ]).skip((page || 0) * (size || 10)).limit(size || 10)

    ])

    return res.send(new ApiResponse(200, 'Successfully fetched products !', {
        products: [...fashionProducts, ...generalProducts]
    }));
});

const shopController = {
    checkUniqueName,
    registerShop,
    editShop,
    getShops,
    getShopInfo,
    searchShop,
    searchProductInShop,
    getShopProducts,
    getShopInfoBySeller
}

module.exports = shopController;