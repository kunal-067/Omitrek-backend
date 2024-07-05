const Management = require("../Models/management.model");
const {
    asyncHandler,
    ApiError,
    ApiResponse
} = require("../Utils/api.util");
const { hashPassword, checkPassword } = require("../Utils/passwordHass");

const getManagementInfo = asyncHandler(async(res,res)=>{
    const {userId} = req.data;
    const user = await Management.findById(userId);
    if(!user){
        return res.status(404).send(
            new ApiError(404, 'User not found ! invalid token.')
        )
    }

    return res.send(
        new ApiResponse(200, 'User info got successfully !', user)
    )
})
const createMember = asyncHandler(async (req, res) => {
    const {
        phone,
        name,
        password,
        role
    } = req.body;
    const user = await Management.findOne({
        phone
    });
    if (user) {
        return res.status(404).send(
            new ApiError(400, 'User already exists')
        )
    }
    const hashedPassword = await hashPassword(password)
    const newMember = await Management.create({
        phone,
        name,
        password:hashedPassword,
        role
    })

    return res.send(
        new ApiResponse(200, 'User created successfully', {user:newMember})
    )
});

const managementLogin = asyncHandler(async(req,res)=>{
    const {phone,password} = req.body;
    const user = await Management.findOne({phone});
    if(!user){
        return res.status(404).send(new ApiError(400,'User not found ! invalid phone no.'))
    }

    const isPass = await checkPassword(password, user.password);
    if(!isPass){
        return res.status(401).send(new ApiError(400,'Wrong password ! try again.'))
    }

    res.status(200).send(new ApiResponse(200, 'Logged in successfully !', {user}))
});
const changeRole = asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    const user = await Management.findById(userId);
    if(!user){
        return res.status(404).send(new ApiError(404,  'User not found ! invalid user  id'))
    }
    await user.update({ role });
    return res.status(200).send(new ApiResponse(200,'Role changed successfully !',{user}))
})

const managementController = {
    getManagementInfo,createMember,managementLogin,changeRole
}

module.exports = managementController;