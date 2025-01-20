import { myCache } from "../app.js";
import { Orders } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculatePercentage } from "../utils/features.utils.js";

// route /api/v1/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res, next) => {
	let stats = {};

	if (myCache.has("adminStats")) {
		stats = JSON.parse(myCache.get("adminStats") as string);

		return res
			.status(200)
			.json(
				new ApiResponse(200, "Dashboard stats fetched successfully", stats)
			);
	}

	const today = new Date();
	const sixMonthsAgo = new Date(today.getMonth() - 6);

	const thisMonth = {
		start: new Date(today.getFullYear(), today.getMonth(), 1),
		end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
	};
	const lastMonth = {
		start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
		end: new Date(today.getFullYear(), today.getMonth(), 0),
	};

	// total number of products of present and last month

	const thisMonthProductsPromise = Product.find({
		createdAt: {
			$gte: thisMonth.start,
			$lte: thisMonth.end,
		},
	});
	const lastMonthProductsPromise = Product.find({
		createdAt: {
			$gte: lastMonth.start,
			$lte: lastMonth.end,
		},
	});

	// total number of users of present and last month

	const thisMonthUsersPromise = User.find({
		createdAt: {
			$gte: thisMonth.start,
			$lte: thisMonth.end,
		},
	});
	const lastMonthUsersPromise = User.find({
		createdAt: {
			$gte: lastMonth.start,
			$lte: lastMonth.end,
		},
	});
	// total number of orders of present and last month

	const thisMonthOrdersPromise = Orders.find({
		createdAt: {
			$gte: thisMonth.start,
			$lte: thisMonth.end,
		},
	});
	const lastMonthOrdersPromise = Orders.find({
		createdAt: {
			$gte: lastMonth.start,
			$lte: lastMonth.end,
		},
	});

	const lastSixMonthOrdersPromise = Orders.find({
		createdAt: {
			$gte: sixMonthsAgo,
			$lte: today,
		},
	});

	const latestTransactionPromise = Orders.find({})
		.limit(5)
		.select(["orderItems", "discount", "total", "status"]);

	// resolve all promise

	const [
		latestTransaction,
		thisMonthProduct,
		lastMonthProduct,
		thisMonthOrders,
		lastMonthOrders,
		thisMonthUsers,
		lastMonthUsers,
		productsCount,
		userCount,
		allOrders,
		lastSixMonthOrders,
		categories,
		femaleCount,
	] = await Promise.all([
		latestTransactionPromise,
		thisMonthProductsPromise,
		lastMonthProductsPromise,
		thisMonthOrdersPromise,
		lastMonthOrdersPromise,
		thisMonthUsersPromise,
		lastMonthUsersPromise,
		Product.countDocuments(),
		User.countDocuments(),
		Orders.find({}).select("total"),
		lastSixMonthOrdersPromise,
		Product.distinct("category"),
		User.countDocuments({ gender: "female" }),
	]);

	const usersChangePercentage = calculatePercentage(
		thisMonthUsers.length,
		lastMonthUsers.length
	);
	const productsChangePercentage = calculatePercentage(
		thisMonthProduct.length,
		lastMonthProduct.length
	);
	const ordersChangePercentage = calculatePercentage(
		thisMonthOrders.length,
		lastMonthOrders.length
	);

	// calculating change in revenue
	const thisMonthRevenue = thisMonthOrders.reduce(
		(total, order) => total + (order.total || 0),
		0
	);
	const lastMonthRevenue = lastMonthOrders.reduce(
		(total, order) => total + (order.total || 0),
		0
	);

	const revenueChangePercentage = calculatePercentage(
		thisMonthRevenue,
		lastMonthRevenue
	);

	const revenue = allOrders.reduce(
		(total, order) => total + (order.total || 0),
		0
	);

	const count = {
		product: productsCount,
		user: userCount,
		order: allOrders.length,
	};

	const orderMonthCounts = new Array(6).fill(0);
	const revenueMonthCounts = new Array(6).fill(0);

	lastSixMonthOrders.forEach((order) => {
		const creationDate = order.createdAt;
		const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

		if (monthDiff < 6) {
			orderMonthCounts[6 - monthDiff - 1] += 1;
			revenueMonthCounts[6 - monthDiff - 1] += order.total;
		}
	});

	// we dont want to execute them one by one. we will do all at a time

	const categoriesCountPromise = categories.map((category) =>
		Product.countDocuments({ category })
	);

	const categoriesCount = await Promise.all(categoriesCountPromise);

	const categoryCount: Record<string, number>[] = [];

	categories.forEach((category, i) => {
		categoryCount.push({
			[category]: Number(
				((categoriesCount[i] / productsCount) * 100).toFixed(0)
			),
		});
	});

	// gender stats

	const genderRatio = {
		female: femaleCount,
		male: userCount - femaleCount,
	};

	const modifiedLatestTransaction = latestTransaction.map((i) => ({
		_id: i._id,
		discount: i.discount,
		amount: i.total,
		status: i.status,
		quantity: i.orderItems.length,
	}));

	stats = {
		latestTransaction: modifiedLatestTransaction,
		genderRatio,
		categoryCount,
		changePercent: {
			usersChangePercentage,
			productsChangePercentage,
			ordersChangePercentage,
			revenueChangePercentage,
		},
		count,
		revenue,
		charts: {
			order: orderMonthCounts,
			revenue: revenueMonthCounts,
		},
	};

	myCache.set("adminStats", JSON.stringify(stats));
	return res
		.status(200)
		.json(new ApiResponse(200, "Dashboard stats fetched successfully", stats));
});

// route /api/v1/dashboard/pie
export const getPieCharts = asyncHandler(async (req, res, next) => {
	let charts = {};

	if (myCache.has("admin-pie-charts")) {
		charts = JSON.parse(myCache.get("admin-pie-charts") as string);

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					"admin pie charts dashboard fetched successfully",
					charts
				)
			);
	}

	const allOrdersPromise = Orders.find({}).select([
		"total",
		"discount",
		"subtotal",
		"tax",
		"shippingCharges",
	]);

	const [
		processingCount,
		shippedCount,
		deliveredCount,
		totalinStock,
		totalOutOfStock,
		allOrders,
		dob,
		allAdmin,
		allUser,
	] = await Promise.all([
		Orders.countDocuments({ status: "PROCESSING" }),
		Orders.countDocuments({ status: "SHIPPED" }),
		Orders.countDocuments({ status: "DELIVERED" }),
		Product.countDocuments({
			stock: {
				$gt: 0,
			},
		}),
		Product.countDocuments({ stock: 0 }),
		allOrdersPromise,
		User.find({}).select("dob"),
		User.countDocuments({ role: "admin" }),
		User.countDocuments({ role: "user" }),
	]);

	const stockAvailability = {
		inStock: totalinStock,
		outStock: totalOutOfStock,
	};

	// revenue distribution
	const grossIncome = allOrders.reduce(
		(prev, order) => prev + (order.total || 0),
		0
	);
	const totalDiscount = allOrders.reduce(
		(prev, order) => prev + (order.discount || 0),
		0
	);
	const productionCost = allOrders.reduce(
		(prev, order) => prev + (order.shippingCharges || 0),
		0
	);
	const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
	const marketingCost = Math.round(grossIncome * 0.3);

	const netMargin =
		grossIncome - totalDiscount - productionCost - burnt - marketingCost;

	const adminAndCustomers = {
		admins: allAdmin,
		customers: allUser,
	};

	const ageGroup = {
		teen: dob.filter((i) => i.age < 18).length,
		adult: dob.filter((i) => i.age < 50 && i.age >= 18).length,
		senior: dob.filter((i) => i.age >= 18).length,
	};

	charts = {
		ageGroup,
		adminAndCustomers,
		revenueDistribution: {
			netMargin,
			totalDiscount,
			productionCost,
			burnt,
			marketingCost,
		},
		orderFullfillment: {
			processingCount,
			shippedCount,
			deliveredCount,
		},
		stockAvailability,
	};

	myCache.set("admin-pie-charts", charts);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				"admin pie charts dashboard fetched successfully",
				charts
			)
		);
});

// route /api/v1/dashboard/bar
export const getBarCharts = asyncHandler(async (req, res, next) => {
	let charts = {};
	const key = "adminBarCharts";
	if (myCache.has(key)) {
		charts = JSON.parse(myCache.get(key) as string);
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					"Admin bar chart data fetched successfully",
					charts
				)
			);
	}

	const today = new Date();
	const sixMonthsAgo = new Date(today.getMonth() - 6);
	const twelveMonthsAgo = new Date(today.getMonth() - 12);


	const sixMonthOrderPromise = Product.find({
		createdAt: {
			$gte: sixMonthsAgo,
			$lte: today
		}
	})

	const sixMonthProductPromise = Product.find({
		createdAt: {
			$gte: sixMonthsAgo,
			$lte: today
		}
	})


	// const [] = await Promise.all([
	// 	Product.find({createdAt : })
	// ])




	myCache.set(key, JSON.stringify(charts));
	return res
		.status(200)
		.json(
			new ApiResponse(200, "Admin bar chart data fetched successfully", charts)
		);
});

// route /api/v1/dashboard/line
export const getLineCharts = asyncHandler(async (req, res, next) => {});
