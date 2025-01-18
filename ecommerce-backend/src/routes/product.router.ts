import express, { Router } from "express";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js";
import adminOnly from "../middlewares/auth.middleware.js";

const app = express.Router();



// route : /api/v1/product/
app.route("/new").post(singleUpload, newProduct);

// to get last 10 products
app.route("/latest").get(getLatestProducts);

// to get all products with filter
app.route("/all").get(getAllProducts);

app.route("/categories").get( getAllCategories);
app.route("/admin-products").get(adminOnly, getAdminProducts);
app.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload , updateProduct).delete(adminOnly ,deleteProduct)




export default app;
