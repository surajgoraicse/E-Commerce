import express from "express";
import adminOnly from "../middlewares/auth.middleware.js";
import {
	allCoupons,
	applyDiscount,
	// createPaymentIntent,
	deleteCoupon,
	generateCoupon,
} from "../controllers/payment.controller.js";

const app = express.Router();

// secure route => /payment/create
// app.post("/create", createPaymentIntent);

// secure route => /payment/coupon/new
app.post("/coupon/new", adminOnly, generateCoupon);

// route => /discount
app.get("/discount", applyDiscount);

// secure route => /coupon/all => returns all coupons
app.get("/coupon/all", adminOnly, allCoupons);

// secure route => /coupon/delete => returns all coupons
app.delete("/coupon/:coupon", adminOnly, deleteCoupon);

export default app;
