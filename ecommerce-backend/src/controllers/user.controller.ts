import { NextFunction, Request, Response } from "express";
import { NewUserRequestBody } from "../types/types.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const newUser = asyncHandler(
	async (
		req: Request<{}, {}, NewUserRequestBody>,
		res: Response,
		next: NextFunction
	) => {
		const { name, photo, dob, email, gender, _id } = req.body;

		let user = await User.findById(_id);
		if (user) {
			return res
				.status(201)
				.json(new ApiResponse(201, "user logged in successfully", user));
		}

		if (!_id || !name || !email || !photo || !gender || !dob) {
			return next(new ApiError(400, "Please add all fields"));
		}

		const newUser = await User.create({
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
			.json(new ApiResponse(201, `user created successfully`, newUser));
	}
);

export const getAllUsers = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const users = await User.find({}).select("-_id -createdAt -updatedAt");
		return res
			.status(200)
			.json(new ApiResponse(200, "Fetched all users successfully", users));
	}
);

export const getUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const id= req.params?.id
		const user = await User.findById(id).select("-_id -createdAt -updatedAt");
		if (!user) {
			next(new ApiError(400 , "user not found"))
		}
		return res
			.status(200)
			.json(new ApiResponse(200, "Fetched user successfully", user));
	}
);

export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params?.id
	const user = await User.findByIdAndDelete(id)
	if (user) {
		return res.status(200).json(new ApiResponse(200 , "User deleted successfully" , user))
	} else {
		next(new ApiError(400 , "user not found"))
	}
})