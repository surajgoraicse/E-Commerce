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


// importing routes
import userRoute from "./routes/user.router.js";

// using routes
app.use("/api/v1/user", userRoute);

app.use(handleErrorMiddleware);

app.listen(port, () => {
	console.log(`Express server is working on http://localhost:${port}`);
});
