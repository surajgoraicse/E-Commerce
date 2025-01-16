import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// middleware to make sure that admin can perform some task
const adminOnly = asyncHandler(async (req ,res,next) => {
    const id = req.query?.id
    
    if(!id) return next(new ApiError(401 , "Saale Login kar pahle"))
    const user = await User.findById(id)
    if (!user) {
        return next(new ApiError(401 , "Salee Fake id deeta hai"))
    }

    if (user.role !== "admin") {
        return next(new ApiError(401, "Salee awakat nahi hai teri "))
    }

    next()

})

export default adminOnly