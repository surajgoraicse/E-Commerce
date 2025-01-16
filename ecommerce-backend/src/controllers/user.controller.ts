import { NextFunction, Request, Response } from "express";
import { NewUserRequestBody } from "../types/types.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const newUser = asyncHandler(
	async (
		req: Request<{}, {}, NewUserRequestBody>,
		res: Response,
		next: NextFunction
	) => {
		const { name, photo, dob, email, gender, _id } = req.body;
		const user = await User.create({
			name,
			photo,
			dob,
			email,
			gender,
			_id,
		});
		console.log("Welcome ", name);
		return res
			.status(201)
			.json(new ApiResponse(201, `user created successfully`, user));
	}
);
