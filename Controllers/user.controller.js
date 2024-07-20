const User = require('../Models/user.model')
const {
    hashPassword,
    checkPassword
} = require('../Utils/passwordHass');
const {
    generateToken
} = require('../Utils/jwt.utils');
const generateReferralCode = require('../Utils/referralCode');
const {
    asyncHandler,
    ApiError,
    ApiResponse
} = require('../Utils/api.util');


const register = asyncHandler(async (req, res) => {
    const {
        phone,
        name,
        password,
        referredBy
    } = req.body;

    const isUserExist = await User.findOne({
        phone
    })
    if (isUserExist) {
        return res.status(400).send(
            new ApiError(400, 'This phone no. has already registered !')
        )
    }

    const generatedReferralCode = await generateReferralCode();
    const hashedPassword = await hashPassword(password)
    const registerApplication = new User({
        phone,
        referredBy,
        name,
        password: hashedPassword,
        referralCode: generatedReferralCode
    });

    if (referredBy) {
        const referral = await User.findOne({
            referralCode: referredBy
        });
        if (!referral) {
            return res.status(405).send(
                new ApiError(405, 'Invalid referral code please write a valid code')
            )
        }
    }


    await registerApplication.save();

    const {
        token,
        expiresAt
    } = generateToken({
        userId: registerApplication._id,
        role: registerApplication.role,
        name: registerApplication.name
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    })
    return res.send(
        new ApiResponse(200, 'You have been registered successfully !', {
            user: {
                name,
                role: 'user'
            },
            token,
            expiresAt
        }))
});
const login = asyncHandler(async (req, res) => {
    const {
        phone,
        password
    } = req.body;

    const user = await User.findOne({
        phone
    });
    if (!user) {
        return res.status(404).send(
            new ApiError(404, "user doesn't exists please register first")
        )
    }

    const isPassRight = await checkPassword(password, user.password)
    if (!isPassRight) {
        return res.status(400).send(
            new ApiError(400, 'Wrong password ! please try again.')
        )
    }

    console.log(user.role, user)

    const {
        token,
        expiresAt
    } = generateToken({
        name: user.name,
        userId: user._id,
        shopId: ((user.role == "Seller") ? user.shop : null),
        role: user.role
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    })
    return res.send(
        new ApiResponse(200, 'You have logined successfully !', {
            user: {
                name: user.name,
                role: user.role
            },
            token,
            expiresAt
        }))

});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie('jwt');
    return res.send(new ApiResponse(200, 'Logout successfully !'));
});

const getUserInfo = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send(new ApiError(404, 'User not found ! invalid user'));
    }

    return res.send(new ApiResponse(200, 'Successfully fetched user data', user));
});

const getReferrals = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(500).send(new ApiError(500, 'server error try later'));
    };

    const referrals = await User.find({
        referredBy: user.referralCode
    })

    return res.send(new ApiResponse(200, 'Referrals fetched successfully !', {
        referrals
    }));
});

const updateProfile = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const updatedProfile = req.body;
    const user = await User.findByIdAndUpdate(userId, updatedProfile, {
        new: true,
        projection: {
            role: 0,
            password: 0,
            transactionPassword: 0
        }
    });

    if (!user) {
        return res.status(404).send(new ApiError(404, 'User not found ! try again.'));
    }

    res.send(new ApiResponse(200, 'Profile updated successfully', user));
});

const updatePassword = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        oldPassword,
        newPassword
    } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).send(new ApiError(404, 'User not found ! try again'));
    }
    if (!oldPassword || !newPassword) {
        return res.status(404).send(new ApiError(404, 'Either old or new password is missing'));
    }

    const isPassRight = await checkPassword(oldPassword, user.password);
    if (!isPassRight) {
        return res.status(401).send(new ApiError(401, "Password isn't matching ! try again"));
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return res.send(new ApiResponse(200, 'Password updated successfully !'));
});

// const getTransactions = asyncHandler(async (req, res) => {
//     const {
//         userId
//     } = req.data;
//     const user = await User.findById(userId, {
//         receivedCoins: 1,
//         sentCoins: 1
//     });

//     if (!user) {
//         return res.status(404).send(new ApiError(404, 'user not found ! try again'));
//     }

//     const {
//         receivedCoins,
//         sentCoins
//     } = user;

//     return res.send(new ApiResponse(200, 'Transactions fetched successful !', {
//         receivedCoins,
//         sentCoins
//     }));
// });


//admin action -----
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}, {
        _id: 1,
        name: 1,
        balance: 1,
        referrals: 1,
        phone: 1
    });

    return res.send(new ApiResponse(200, 'Successfully fetched all users.', {
        users
    }));
});

const searchUser = asyncHandler(async (req, res) => {
    const userId = req.query.id;
    const userName = req.query.name;

    let data;
    if (userId) {
        data = await User.find({
            _id: userId
        });
    } else if (userName) {
        data = await User.find({
            name: userName
        });
    } else {
        return res.status(401).send(new ApiError(401, 'Arguments missing userName or userId is required !'));
    }

    return res.send(new ApiResponse(200, 'Successfully searched users !', {
        users: data
    }));
});

const deleteUser = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.body;

    const user = await User.findByIdAndDelete(userId)
    if (!user) {
        return res.status(404).send(
            new ApiError(404, 'Invalid userid ! no user found.')
        )
    }
    return res.send(new ApiResponse(204, 'User deleted successfully !', {
        user
    }));

});

const userController = {
    register,
    login,
    logout,
    getReferrals,
    getUserInfo,
    updateProfile,
    updatePassword,
    getAllUsers,
    searchUser,
    deleteUser
}

module.exports = userController;