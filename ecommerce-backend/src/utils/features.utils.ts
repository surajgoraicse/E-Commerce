import { myCache } from "../app.js";
import { Product } from "../models/product.model.js";
import { InvalidateCacheProps, orderItemsType } from "../types/types.js";

export const invalidateCache = async ({
	product,
	order,
	admin,
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
	}
	if (admin) {
	}
};


export const reduceStock = async (orderItems : orderItemsType[]) => {
	for (let i = 0; i < orderItems.length; i++){
		const order = orderItems[i]
		const product = await Product.findById(order.productId)
		if (!product) {
			throw new Error( "Product not found")
		}
		// TODO:  check if sufficient stock is present or not
		product.stock -= order.quantity
		await product.save();
	}
}