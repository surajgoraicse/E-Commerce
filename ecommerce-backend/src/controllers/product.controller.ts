import "dotenv/config";
import { Request } from "express";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	BaseQueryType,
	NewProductRequestBody,
	SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.utils.js";


// caching
export const getLatestProducts = asyncHandler(async (req, res, next) => {
	let products;
	if (myCache.has("latestProducts")) {
		products = JSON.parse(myCache.get("latestProducts") as string);
		console.log("getting data from cache\n");
	} else {
		products = await Product.find({}).sort({ createdAt: -1 }).limit(10);
		myCache.set("latestProducts", JSON.stringify(products), 200);
		console.log("storing data in cache");
	}
	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", products));
});

// caching
export const getAllCategories = asyncHandler(async (req, res, next) => {
	// const categories = await Product.find({}, { category: 1 });
	// const list  = categories.map((product)=>{return product.category})
	// console.log(new Set(list));

	let categories;
	if (myCache.has("categories")) {
		categories = JSON.parse(myCache.get("categories") as string);
	} else {
		categories = await Product.distinct("category");
		myCache.set("categories", JSON.stringify(categories));
		console.log("caching categories");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", categories));
});

// caching
export const getAdminProducts = asyncHandler(async (req, res, next) => {
	let products;
	if (myCache.has("all-products")) {
		products = JSON.parse(myCache.get("allProducts") as string);
	} else {
		products = await Product.find({});
		myCache.set("all-products", JSON.stringify(products));
		console.log("caching all products");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", products));
});


// caching
export const getSingleProduct = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	let product;
	if (myCache.has(`product-${id}`)) {
		product = JSON.parse(myCache.get(`product-${id}`) as string);
		console.log("fetching data from cache" , product);
	} else {
		product = await Product.findById(id);
		myCache.set(`product-${id}`, JSON.stringify(product));
		console.log("caching single product");
	}
	

	return res
		.status(200)
		.json(new ApiResponse(200, "Product fetched successfully", product));
});

export const getAllProducts = asyncHandler(
	async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
		const { search, sort, price, category } = req.query;
		const page = Number(req.query?.page) || 1;

		const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
		const skip = limit * (page - 1);

		const baseQuery: BaseQueryType = {};

		if (search) {
			baseQuery.name = { $regex: search, $options: "i" };
		}
		if (price) {
			baseQuery.price = { $lte: Number(price) };
		}
		if (category) {
			baseQuery.category = category;
		}

		// pagenation
		// TODO: sort can be undefined and in that case the value passed will be false which is unexpected

		const productPromise = Product.find(baseQuery)
			.sort(sort && { price: sort === "asc" ? 1 : -1 })
			.limit(limit)
			.skip(skip);

		const [products, allFilterProductCount] = await Promise.all([
			productPromise,
			Product.find(baseQuery).countDocuments(),
		]);

		const totalPages = Math.ceil(allFilterProductCount / limit);

		return res.status(200).json(
			new ApiResponse(200, "Product fetched successfully", {
				products,
				allFilterProductCount,
				totalPages,
			})
		);
	}
);


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
			await invalidateCache({product : true})
			return res
				.status(201)
				.json(new ApiResponse(201, "Product created successfully", product));
		} else next(new ApiError(400, "Product creation failed"));
	}
);
9

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
	await invalidateCache({product : true})

	return res
		.status(200)
		.json(new ApiResponse(200, "Product updated successfully", newProduct));
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(404, "Saale ID sahi bheej");
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

	await invalidateCache({product : true})

	return res
		.status(200)
		.json(new ApiResponse(200, "Product deleted successfully", product));
});


// generating products

// import { faker } from "@faker-js/faker";
// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\5ba9bd91-b89c-40c2-bb8a-66703408f986.png",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

// delete ramdom products
// const deleteRandomProducts = async (count : number = 10) => {
// 	const products = await Product.find({}).skip(8).limit(count);

// 	for (let i = 0; i < count; i ++ ){  // TODO: optimise it
// 		const product = products[i]
// 		await product.deleteOne()
// 	}

// 	console.log({success : true});
// };
