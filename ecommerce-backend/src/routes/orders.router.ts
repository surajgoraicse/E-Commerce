import express from "express";
import adminOnly from "../middlewares/auth.middleware.js";
import { allOrders, deleteOrder, getSingleOrder, myOrder, newOrder, processOrder } from "../controllers/orders.controller.js";

const app = express.Router()


// route  /api/v1/orders/new  => creates a new order
app.post("/new" , newOrder)


// route /api/v1/orders/my  => gives the list of orders in an id
app.get("/my", myOrder)

//  route /api/v1/orders/all  => return all orders
app.get("/all" ,adminOnly ,  allOrders)



//  route /api/v1/orders/singleOrder 
app.route("/:id").get(getSingleOrder).put(adminOnly ,processOrder).delete(adminOnly , deleteOrder)




export default app


