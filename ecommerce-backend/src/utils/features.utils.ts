import { myCache } from "../app.js";
import { Product } from "../models/product.model.js";
import { InvalidateCacheProps } from "../types/types.js";

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
