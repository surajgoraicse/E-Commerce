import "dotenv/config";
import mongoose from "mongoose";


export const connectDB = async () => { 
	mongoose
		.connect("mongodb://localhost:27017", { dbName: "Ecommerce" })
		.then((db) => {
			console.log("Database connected succesfully : ", db.connection.host);
		})
		.catch((err) => {
			console.error("Database connection Failed");
			process.exit(1);
		});
};


export const invalidateCache = () => {
	 
}