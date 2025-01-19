import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Orders } from "../models/order.model.js";
import { invalidateCache, reduceStock } from "../utils/features.utils.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { myCache } from "../app.js";
import { User } from "../models/user.model.js";

// route  /api/v1/orders/new  => creates a new order
export const newOrder = asyncHandler(
	async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
		console.log("hello world");

		const {
			shippingCharges,
			shippingInfo,
			user,
			tax,
			subTotal,
			discount,
			total,
			orderItems,
		} = req.body;
		console.log(orderItems);

		if (
			!shippingCharges ||
			!shippingInfo ||
			!user ||
			!tax ||
			!subTotal ||
			!discount ||
			!total ||
			!orderItems
		) {
			res.status(400).json(new ApiError(400, "Enter all order fields"));
		}
		// validate shippingInfo , shippingCharges and orderItems
		// check if productId is provided or not TODO:

		const orderDetails = await Orders.create({
			shippingCharges,
			shippingInfo,
			user,
			tax,
			subTotal,
			discount,
			total,
			orderItems,
		});

		await reduceStock(orderItems);

		await invalidateCache({ product: true, order: true, admin: true });

		res
			.status(201)
			.json(new ApiResponse(201, "Order places successfully ", orderDetails));
	}
);

// route /api/v1/orders/my  => gives the list of orders in an id
export const myOrder = asyncHandler(async (req, res, next) => {
	throw new ApiError(400 , "my error")
	const id = req.query?.id;

	// checking if the user exits

	const userAvailable = await User.find({ id });
	if (userAvailable.length === 0) {
		return res.status(404).json(new ApiResponse(404, "User not found", null));
	}

	const key = `myOrder-${id}`;

	let orders: NewOrderRequestBody | never[] = [];
	if (myCache.has(key)) {
		orders = JSON.parse(myCache.get(key) as string);
	} else {
		orders = await Orders.find({ user: id });
		// we will not throwing any error in case there is no order.
		myCache.set(key, JSON.stringify(orders));
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Orders fetched successfully", orders));
});

//  route /api/v1/orders/all  => return all orders
export const allOrders = asyncHandler(async (req, res, next) => {
	let orders: NewOrderRequestBody[] = [];

	if (myCache.has("allOrders")) {
		orders = JSON.parse(myCache.get("allOrders") as string);
	} else {
		orders = await Orders.find({});
		myCache.set("allOrders", JSON.stringify(orders));
	}

	res
		.status(200)
		.json(new ApiResponse(200, "Orders fetched successfully ", orders));
});
