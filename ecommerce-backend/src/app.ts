import "dotenv/config";
import express from "express";
import handleErrorMiddleware from "./middlewares/handleErrorMiddleware.js";
import { connectDB } from "./utils/db.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import Stripe from "stripe";


const port = process.env.PORT || 8000;
const stripeKey = process.env.STRIPE_KEY || ""
const app = express();


// export const stripe = new Stripe(stripeKey)
export const myCache = new NodeCache()

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
app.use( morgan("dev"))

// importing routes
import userRoute from "./routes/user.router.js";
import productRoute from "./routes/product.router.js"
import ordersRoute from "./routes/orders.router.js"
import paymentRoute from "./routes/payment.router.js"
import dashboardRoute from "./routes/stats.router.js"
import adminOnly from "./middlewares/auth.middleware.js";



// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product",  productRoute);
app.use("/api/v1/orders" , ordersRoute)
app.use("/api/v1/payment" , paymentRoute)
app.use("/api/v1/dashboard" ,adminOnly ,  dashboardRoute)



app.use(handleErrorMiddleware);
app.listen(port, () => {
	console.log(`Express server is working on http://localhost:${port}`);
});
