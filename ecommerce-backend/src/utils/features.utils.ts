import { myCache } from "../app.js";
import { Orders } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { InvalidateCacheProps, orderItemsType } from "../types/types.js";

export const invalidateCache = async ({
	product,
	order,
	admin,
	userId,
	orderId,
}: InvalidateCacheProps) => {
	if (product) {
		const productKeys: string[] = [
			"latestProducts",
			"categories",
			"allProducts",
		];
		const productsId = await Product.find({}).select("_id");
		productsId.forEach((obj) => {
			productKeys.push(`product-${obj.id}`);
		});
		myCache.del(productKeys);
	}
	if (order) {
		const orderKeys: string[] = [
			"allOrders",
			`myOrder-${userId}`,
			`order-${orderId}`,
		];
		myCache.del(orderKeys);
	}
	if (admin) {
		const adminKeys : string[]= ["adminStats" , "admin-pie-charts" , "adminBarCharts"]
		


		myCache.del(adminKeys)
	}
};

export const reduceStock = async (orderItems: orderItemsType[]) => {
	for (let i = 0; i < orderItems.length; i++) {
		const order = orderItems[i];
		const product = await Product.findById(order.productId);
		if (!product) {
			throw new Error("Product not found");
		}
		// TODO:  check if sufficient stock is present or not
		product.stock -= order.quantity;
		await product.save();
	}
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
	if (lastMonth === 0) {
		return thisMonth * 100;
	}
	const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
	return Number(percent.toFixed(0));
};
