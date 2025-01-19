import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewOrderRequestBody } from "../types/types.js";


export const newOrder = asyncHandler(async (req: Request<{}, {}, NewOrderRequestBody >  , res , next) => {
    
})