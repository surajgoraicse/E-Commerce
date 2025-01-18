import "dotenv/config";
import express from "express";
import handleErrorMiddleware from "./middlewares/handleErrorMiddleware.js";
import { connectDB } from "./utils/db.js";

const port = process.env.PORT || 8000;
const app = express();

// connecting db
connectDB();

// configuring express app
app.use(
	express.json({
		limit: "20kb",
	})
);
app.use(express.urlencoded())
app.use("/uploads",express.static("uploads"))


// importing routes
import userRoute from "./routes/user.router.js";
import productRoute from "./routes/product.router.js"
import adminOnly from "./middlewares/auth.middleware.js";

// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product",  productRoute);



app.use(handleErrorMiddleware);
app.listen(port, () => {
	console.log(`Express server is working on http://localhost:${port}`);
});
