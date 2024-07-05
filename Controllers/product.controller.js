const Product = require("../Models/product.model");
const Shop = require("../Models/shop.model");
const User = require("../Models/user.model");
const Category = require('../Models/categories.model');

const {
    asyncHandler,
    ApiError,
    ApiResponse
} = require("../Utils/api.util");

//general pipeline for fetching products
const getPipeLine = ({
    searchedKey,
    category,
    size,
    page,
    coordinates
}) => {
    const pipeLine = [];

    if (coordinates) {
        pipeLine.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates,
                },
                key: 'uploadedFrom',
                includeLocs: 'locatedAt',
                distanceMultiplier: 6371,
                distanceField: "distance",
                spherical: true,
            }
        })
    }
    const pagination = [{
        $skip: (page || 0) * (size || 20)
    }, {
        $limit: size || 20
    }];

    if (category) {
        pipeLine.push({
            category
        })
    };
    if (searchedKey) {
        pipeLine.push({
            $match: {
                $text: {
                    $search: searchedKey
                }
            }
        });
    };

    if (coordinates) {
        pipeLine.push(...pagination);
    } else {
        pipeLine.push({
            $sample: {
                size: size || 20
            }
        })
    }

    pipeLine.push({
        $project: {
            name: 1,
            description: 1,
            image: {
                $arrayElemAt: ["$images", 0]
            },
            price: 1,
            discount: 1,
            rate: 1,
            distance: 1,
            locatedAt: 1
        }
    })

    return pipeLine;
}


//send random products to user based on size
const getRandomProducts = asyncHandler(async (req, res) => {
    const {
        coordinates,
        size,
        page
    } = req.query;

    let pipeLine = getPipeLine({
        coordinates: coordinates?.split(',').map(Number),
        size: parseInt(size),
        page: parseInt(page)
    })

    const products = await Product.aggregate(pipeLine);

    return res.send(new ApiResponse(200,
        'successfull fetched products',
        products
    ))
})

//search product based on key and size
const searchProduct = asyncHandler(async (req, res) => {
    const {
        size,
        coordinates,
        key,
        page
    } = req.query;

    if (!key) {
        throw new ApiError(404, 'Search parameter is missing !');
    }

    let pipeLine = getPipeLine({
        coordinates: coordinates?.split(',').map(Number),
        size: parseInt(size),
        key,
        page: parseInt(page)
    })

    const products = await Product.aggregate(pipeLine);
    return res.send(new ApiResponse(200, 'successfull fetched successfully', products))

})
const getByCategory = asyncHandler(async (req, res) => {
    const {
        type,
        category,
        coordinates,
        size,
        page
    } = req.query;

    if (!category && !type) {
        return res.status(402).send({
            msg: 'missing category or productType'
        })
    }
    let pipeLine = getPipeLine({
        coordinates: coordinates?.split(',').map(Number),
        size: parseInt(size),
        page: parseInt(page),
        category
    })


    let products = await Product.aggregate(pipeLine)
    return res.send(new ApiResponse(200, `products of ${category} are`, products))
})
const getProductInfo = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(401).send(
            new ApiError(401, 'Missing parameters !', 'id in params is required and necessary')
        )
    }

    let product = await Product.findById(productId);
    console.log(product)
    return res.send(new ApiResponse(200, 'successfull fetched product', product))
})


const addProduct = asyncHandler(async (req, res) => {
    const {
        userId,
        shopId
    } = req.data;

    const {
        description,
        category,
        name,
        variants,
        coordinates,
        images,
        quantity,
        mrp,sp,discount
    } = req.body;


    const shop = await Shop.findById(shopId);
    if (!shop) {
        return res.status(402).send(
            new ApiError(402, 'You are not allowed to perform these action', 'may be your role are not set to admin or seller')
        )
    }

    let product = new Product({
        shop:shopId,
        name,
        category,
        description,
        variants,
        images,
        mrp,sp,discount,quantity,
        uploadedFrom:{
            coordinates : coordinates || shop.location?.coordinates
        }
    });

    await product.save();

    return res.status(201).send(
        new ApiResponse(201, 'Product added successfully !', product)
    );

})

const editProduct = asyncHandler(async (req, res) => {
    const {
        shopId
    } = req.data;
    const {
        productId,
        modifiedData
    } = req.body;

    const product = await Product.findOneAndUpdate({
        _id: productId,
        shop: shopId
    }, modifiedData, {
        new: true
    });

    if (!product) {
        return res.status(404).send(new ApiError(404, "Invalid attempt this product is not valid"))
    }

    return res.status(202).send(
        new ApiResponse(202, 'Product data updated successfully !', product)
    )
})

//admin action
const approveProduct = asyncHandler(async (req, res) => {
    const {
        productId,
        status
    } = req.body;

    let product = await Product.findById(productId);

    if (product) {
        return res.status(404).send(
            new ApiError(404, 'Product not found ! invalid id.')
        )
    }

    if (status == 'Decline') {
        await product.deleteOne();
        return res.status(204).send(
            new ApiResponse(204, 'Product removed successfully !', product)
        )
    }

    product.status = status;
    await product.save();

    return res.send(
        new ApiResponse(205, 'Product status approved successfully !', product)
    )

})

const productController = {
    getByCategory,
    getRandomProducts,
    searchProduct,
    getProductInfo,
    addProduct,
    editProduct,
    approveProduct
}

module.exports = productController;