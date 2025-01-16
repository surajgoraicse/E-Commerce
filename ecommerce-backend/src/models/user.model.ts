import mongoose, { Schema } from "mongoose";
import validator from "validator";


interface IUser extends Document {
	_id: string;
	name: string;
	role: string;
	email: string;
	gender: string;
	dob: Date;
	photo: String;
	createdAt: Date;
	updatedAt: Date;

	//virtual attribute
	age: number
}

const userSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: [true, "Please enter ID"],
		},
		name: {
			type: String,
			required : [true , "Enter user name"]
		},
		photo: {
			type: String,
			required: [true, "Please add photo"],
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		email: {
			type: String,
			required: [true, "Please enter email"],
			unique: [true, "Email already exists"],
			validate: validator.default.isEmail,
		},
		gender: {
			type: String,
			enum: ["male", "female"],
			required: ["true", "Please enter gender"],
		},
		dob: {
			type: Date,
			required: ["true", "Please enter Date of Birth"],
		},
	},
	{ timestamps: true }
);

userSchema.virtual("age").get(function () {
	const today = new Date();
	const dob = this.dob;
	if (!dob) return null;
	let age = today.getFullYear() - dob.getFullYear();
	if (
		dob?.getMonth() > today.getMonth() ||
		(dob?.getMonth() > today.getMonth() && dob?.getDate() > today.getDate())
	) {
		age--;
	}
	return age;
});

export const User = mongoose.model<IUser>("User", userSchema);
