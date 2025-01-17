import { Request } from "express";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const newProduct = asyncHandler(
	async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
		const { name, price, stock, category } = req.body;
		const photo = req.file;

		// validate
		if (!photo) {
			return next(new ApiError(400, "Please provide an photo"));
		}
		if (!name || !price || !stock || !category) {
			fs.rm(photo?.path, () => {
				console.log("Photo removed");
			});
			return next(new ApiError(400, "Please provide all details"));
		}

		// save in db
		const product = await Product.create({
			name,
			price,
			stock,
			category: category.toLowerCase(),
			photo: photo?.path,
		});
		if (product) {
			return res
				.status(201)
				.json(new ApiResponse(201, "Product created successfully", product));
		} else next(new ApiError(400, "Product creation failed"));
	}
);


export const getLatestProducts = asyncHandler(
	async (req, res, next) => {
		const products = await Product.find({}).sort({ createdAt: -1 }).limit(5)
		

		return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", products));
	}
);


