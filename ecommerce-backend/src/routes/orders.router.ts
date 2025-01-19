import express from "express";
import adminOnly from "../middlewares/auth.middleware.js";
import { allOrders, myOrder, newOrder } from "../controllers/orders.controller.js";

const app = express.Router()


// route  /api/v1/orders/new  => creates a new order
app.post("/new" , newOrder)


// route /api/v1/orders/my  => gives the list of orders in an id
app.get("/my", myOrder)

//  route /api/v1/orders/all  => return all orders
app.get("/all" ,adminOnly ,  allOrders)





export default app