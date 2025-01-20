import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewCouponRequestBody } from "../types/types.js";
import ApiError from "../utils/ApiError.js";
import { Coupon } from "../models/coupon.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { myCache } from "../app.js";

export const generateCoupon = asyncHandler(
	async (req: Request<{}, {}, NewCouponRequestBody>, res, next) => {
		const { coupon, amount } = req.body;
		if (!coupon || !amount) {
			return next(new ApiError(400, "Please Provide coupon and amount"));
		}

		const generatedCoupon = await Coupon.create({ coupon, amount });

		if (generatedCoupon) {
			return res
				.status(201)
				.json(
					new ApiResponse(201, "Coupon created successfully", generatedCoupon)
				);
		} else {
			return next(
				new ApiError(500, "Coupon creation failed due of server issue")
			);
		}
	}
);

export const applyDiscount = asyncHandler(async (req, res, next) => {
	const { coupon } = req.body;
	if (!coupon) {
		return next(new ApiError(404, "Enter coupon"));
	}

	const apply = await Coupon.findOne({ coupon });
	console.log(apply);

	if (!apply) {
		return next(new ApiError(404, "Invalid coupon"));
	}

	res
		.status(200)
		.json(new ApiResponse(200, "Coupon valid", { discount: apply.amount }));
});

// TODO: invalidate allCoupons cache
export const allCoupons = asyncHandler(async (req, res, next) => {
	let all: NewCouponRequestBody[] | undefined;
	if (myCache.has("allCoupons")) {
		all = myCache.get("allCoupons");
	} else {
		all = await Coupon.find({});
		if (!all) {
			return next(new ApiError(500, "Server error fetching all coupons "));
		}
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Coupons fetched successfully", all));
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
	const { coupon } = req.params;
	if (!coupon) {
		return next(new ApiError(404, "Please pass the coupon"));
	}

	const deletedCoupon = await Coupon.deleteOne({ coupon });

	if (deletedCoupon.deletedCount === 0) {
		return next(new ApiError(404, "Coupon does not exist"));
	}

	myCache.del("allCoupons");
	return res
		.status(200)
		.json(new ApiResponse(200, "Coupon deleted successfully", deletedCoupon));
});
