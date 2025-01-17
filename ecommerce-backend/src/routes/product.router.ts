import express, { Router } from "express";
import { getLatestProducts, newProduct } from "../controllers/product.controller.js";
import adminOnly from "../middlewares/auth.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const app = express.Router();



// secure route : /api/v1/product/
app.route("/new").post(adminOnly, singleUpload, newProduct);
app.route("/latest").get(adminOnly , getLatestProducts);




export default app;
