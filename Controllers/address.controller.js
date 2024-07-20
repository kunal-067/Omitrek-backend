const User = require("../Models/user.model");
const {
    asyncHandler,
    ApiError,
    ApiResponse
} = require("../Utils/api.util");

const getAddresses = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const user = await User.findById(userId);
    const userAdd = req.query.user;
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found ! Invalid user id"))
    }

    const address = user.addresses;
    if (user.role == 'Admin' && userAdd) {
        const getAddUser = await User.findById(userAdd);
        if (!getAddUser) {
            return res.status(404).json(new ApiError(404, "User not found ! Invalid user id"))
        }
        address = getAddUser.addresses
    }

    return res.send(new ApiResponse(200, "Successfully fetched addresses", address))
});

const addAddress = asyncHandler(async (req, res) => {
    const {
        name,
        phone,
        address,
        landMark,
        houseNo,
        street,
        city,
        state,
        pinCode,
        country,
        coordinate,

        isDefault
    } = req.body;
    const {
        userId
    } = req.data;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found ! Invalid user id"))
    }

    const addressD = {
        name,
        address,
        city,
        state,
        pinCode,
        phone,
        landMark,
        houseNo,
        street,
        country,

        coordinate
    }

    if (user.addresses.length == 0) {
        addressD.isDefault = true;
    }
    if(isDefault){
        const defaultAddress = user.addresses.find(a => a.isDefault == true);
        defaultAddress.isDefault = false;
        addressD.isDefault = true;
    }
    user.addresses.push(addressD)
    await user.save();

    return res.send(new ApiResponse(200, "Address saved successfully !", user.addresses[user.addresses.length-1]))
});

const updateAddress = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        addressId,
        updatedAddress,
        isDefault
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found ! Invalid user id"))
    }
    const addressIndex = user.addresses.findIndex((a) => a._id == addressId);
    if (!addressIndex) {
        return res.status(404).send(new ApiError(404, "Invalid addressId !"))
    }

    if(isDefault && isDefault == true){
        const defaultAddress = user.addresses.find(a => a.isDefault == true);
        if(defaultAddress){defaultAddress.isDefault = false;}
        updatedAddress.isDefault = true;
    }
    user.addresses[addressIndex] = updatedAddress;
    await user.save();

    console.log(updatedAddress)
    return res.send(new ApiResponse(200, "Address updated successfully !", updatedAddress))
});

const deleteAddress = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.data;
    const {
        addressId
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found ! Invalid user id"))
    }
    const addressIndex = user.addresses.findIndex((a) => a._id == addressId);
    
    if (addressIndex==-1) {
        return res.status(404).send(new ApiError(404, "Invalid addressId ! please try later", '', ''));
    }

    const x = user.addresses.splice(addressIndex, 1);
    if(user.addresses.length == 1){
        user.addresses[0].isDefault = true
    }
    await user.save();

    return res.send(new ApiResponse(200, "Address deleted successfully !", x))
});

const addressController = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
}

module.exports = addressController;