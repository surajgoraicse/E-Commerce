import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		shippingInfo: {
			address: {
				type: String,
				required: true,
			},
			city: {
				type: String,
				required: true,
			},
			state: {
				type: String,
				required: true,
			},
			country: {
				type: String,
				required: true,
			},
			pincode: {
				type: Number,
				required: true,
			},
		},
		user: {
			type: String,
			ref: "User",
			required: true,
		},
		subTotal: {
			type: Number,
			required: true,
		},
		tax: {
			type: Number,
			required: true,
		},
		shippingCharges: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},

		status: {
			type: String,
			enum: ["PROCESSING", "SHIPPED", "DELIVERED"],
			default: "PROCESSING",
		},
		orderItems: [
			{
				name: {
					type: String,
				},
				photo: String,
				price: Number,
				quantity: Number,
				productId: {
					type: mongoose.Types.ObjectId,
					ref: "Product",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

export const Orders = mongoose.model("Orders", orderSchema);
