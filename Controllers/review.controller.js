const {
    asyncHandler,
    ApiResponse,
    ApiError
} = require("../Utils/api.util");
const Review = require("../Models/reviews.model");
const User = require("../Models/user.model");

const addReview = asyncHandler(async (req, res) => {
    const {
        userId,
        role
    } = req.data;
    const {
        productId,
        message,
        name
    } = req.body;

    const user = await User.findById(userId);
    if (!user && role != "admin") {
        return res.status(404).json(
            new ApiError(404, "Invalid token ! user not found.")
        )
    }

    const userName = role == "Admin" ? name : user.name;
    const type = role == "Admin" ? "Fake" : "Real";
    const newReview = new Review({
        user: userId,
        product: productId,
        type,
        userName,
        message,
    })
    await newReview.save();
    return res.send(
        new ApiResponse(200, "Review added successfully !", {
            review: newReview
        })
    );

})
const getProductreview = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const reviews = await Review.find({
        product: productId
    }, {
        createdAt: 0,
        updatedAt: 0,
        type: 0
    });
    return res.send(
        new ApiResponse(200, "Reviews collected successfully !",
            reviews)
    )

})

//admin actions -------
const getAllReviews = asyncHandler(async (req, res) => {
    const {
        size,
        page
    } = req.query;

    const reviews = await Review.find({}).sort({
            createdAt: -1
        }) // Sort by createdAt field in descending order (recent first)
        .skip((page || 0) * (size || 30)).limit(size || 30);

    return res.json(
        new ApiResponse(200, "Successfully fetched reviews.",
            reviews)
    );

})
const deleteReview = asyncHandler(async (req, res) => {
    const reviewId = req.params.id;

    const review = await Review.findByIdAndDelete(reviewId);
    return res.send(
        new ApiResponse(200, "Review deleted successfully !", {
            review
        })
    )

})

const reviewController= {
    addReview,getProductreview,getAllReviews,deleteReview
}

module.exports = reviewController;