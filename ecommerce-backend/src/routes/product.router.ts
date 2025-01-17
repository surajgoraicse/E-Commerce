import express, { Router } from "express";
import { deleteProduct, getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const app = express.Router();



// secure route : /api/v1/product/
app.route("/new").post( singleUpload, newProduct);
app.route("/latest").get( getLatestProducts);
app.route("/categories").get( getAllCategories);
app.route("/admin-products").get( getAdminProducts);
app.route("/:id").get(getSingleProduct).put(singleUpload , updateProduct).delete(deleteProduct)




export default app;
