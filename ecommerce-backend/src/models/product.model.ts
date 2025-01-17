import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter name"],
		},
		photo: {
			type: String,
			required: [true, "Please provide photo"],
		},
		price: {
			type: Number,
			required: [true, "Please enter price"],
		},
		stock: {
			type: Number,
			required: [true, "Please enter stock"],
		},
		category: {
			type: String,
			required: [true, "Please enter category"], // TODO: make an enum as category should be specific
            trim: true
		},
	},
	{ timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
