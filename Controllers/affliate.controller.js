const User = require("../Models/user.model");
const { asyncHandler, ApiError, ApiResponse } = require("../Utils/api.util")

const becomeAffliate = asyncHandler(async(res,res)=>{
    const {userId} = req.data;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).send(new ApiError(404,"Invalid attempt! User not found"))
    }

    user.role  = "Affliate";
    await user.save();

    return res.send(new ApiResponse(200, "Successfully become affliate."));
})


const affliateController = {
    becomeAffliate
}
module.exports = affliateController;