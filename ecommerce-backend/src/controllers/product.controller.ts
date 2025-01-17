import { Request } from "express";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

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

export const getLatestProducts = asyncHandler(async (req, res, next) => {
	const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", products));
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
	// const categories = await Product.find({}, { category: 1 });
	// const list  = categories.map((product)=>{return product.category})
	// console.log(new Set(list));

	const categories = await Product.distinct("category");
	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", categories));
});

export const getAdminProducts = asyncHandler(async (req, res, next) => {
	const products = await Product.find({});

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", products));
});

export const getSingleProduct = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const product = await Product.findById(id);

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", product));
});

export const updateProduct = asyncHandler(async (req, res, next) => {
	const id = req.params?.id;
	const { name, price, stock, category } = req.body;
	const photo = req.file;

	if (!id) {
		throw new ApiError(400, "ID bheej saale");
	}

	const product = await Product.findById(id);
	if (!product) {
		throw new ApiError(404, "Saale Product exist hi nahi karta, Id check kar");
	}
	if (photo) {
		fs.rm(product.photo, () => {
			console.log("Photo removed successfully");
		});
		product.photo = photo.path;
	}

	if (name) product.name = name;
	if (price) product.price = price;
	if (stock) product.stock = stock;
	if (category) product.category = category;

	const newProduct = await product.save();
	// console.log(newProduct);

	return res
		.status(200)
		.json(new ApiResponse(200, "Product updated successfully", newProduct));
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(404 , "Saale ID sahi bheej")
	}
	// const product = await Product.findById(id)
	// product?.deleteOne()

	const product = await Product.findByIdAndDelete(id);
	if (!product) {
		throw new ApiError(404, "Saale Product exist hi nahi karta");
	}
	fs.rm(product?.photo, () => {
		console.log("photo removed successfully");
	});
	return res 
		.status(200)
		.json(new ApiResponse(200, "Product deleted successfully", product));
});
