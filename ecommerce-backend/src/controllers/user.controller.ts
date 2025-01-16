import { NextFunction, Request, Response } from "express";
import { NewUserRequestBody } from "../types/types.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const newUser = asyncHandler(
	async (
		req: Request<{}, {}, NewUserRequestBody>,
		res: Response,
		next: NextFunction
	) => {
		try {
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
				.json({ statusCode: 201, message: `Welcome, ${name}` });
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ statusCode: 400, message: "User creation failed" });
		}
	}
);
