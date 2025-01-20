import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Orders } from "../models/order.model.js";
import { invalidateCache, reduceStock } from "../utils/features.utils.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { myCache } from "../app.js";
import { User } from "../models/user.model.js";


// route /api/v1/orders/my  => gives the list of orders in an id
export const myOrder = asyncHandler(async (req, res, next) => {
	const id = req.query?.id;
	// checking if the user exits

	const userAvailable = await User.find({ _id: id });
	if (userAvailable.length === 0) {
		return next(new ApiError(404 , "User does not exists"));
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
	let orders = [];

	if (myCache.has("allOrders")) {
		orders = JSON.parse(myCache.get("allOrders") as string);
	} else {
		// TODO: learn about populate
		orders = await Orders.find().populate("user", "name");
		myCache.set("allOrders", JSON.stringify(orders));
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Orders fetched successfully ", orders));
});

//  route /api/v1/orders/:id  => return a order based on order id
export const getSingleOrder = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	console.log(id);

	let order: {} | null = {};
	const key = `order-${id}`;

	if (myCache.has(key)) {
		console.log("getting from cache");
		order = JSON.parse(myCache.get(key) as string);
	} else {
		order = await Orders.findById(id).populate("user", "name");
		if (!order) {
			return res.status(404).json(new ApiError(404, "order does not exist "));
		}
		myCache.set(key, JSON.stringify(order));
	}
	

	return res
		.status(200)
		.json(new ApiResponse(200, "Order fetched successfully ", order));
});

//  route /api/v1/orders/:id  => process a order
export const processOrder = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const order = await Orders.findById(id);
	console.log(order);
	if (!order) {
		// return res.status(404).json(new ApiError(404, "Order not found"));
		return next(new ApiError(404 , "Order Id does not exist"))
	}
	switch (order.status) {
		case "PROCESSING": {
			order.status = "SHIPPED";
			break;
		}
		case "SHIPPED": {
			order.status = "DELIVERED";
			break;
		}
		case "DELIVERED": {
			order.status = "DELIVERED";
			break;
		}
	}

	await order.save();

	await invalidateCache({ order: true, admin: true , userId : order.user , orderId : id });

	return res
		.status(200)
		.json(new ApiResponse(200, "Order Processed successfully ", order));
});

//  route /api/v1/orders/:id  => delete a order
export const deleteOrder = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const order = await Orders.findByIdAndDelete(id).populate("user", "name");
	
	if (!order) {
		return next(new ApiError(404 , "order not found"));
	}
	await invalidateCache({ order: true, admin: true , orderId : id});

	return res
		.status(200)
		.json(new ApiResponse(200, "Order Deleted successfully ", order));
});


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

		await invalidateCache({ product: true, order: true, admin: true, userId : user});

		res
			.status(201)
			.json(new ApiResponse(201, "Order places successfully ", orderDetails));
	}
);
