import express from "express"
import adminOnly from "../middlewares/auth.middleware.js"
import { getDashboardStats } from "../controllers/stats.controller.js"


const app = express.Router()


// route /api/v1/dashboard/stats
app.get("/stats" , getDashboardStats)

// route /api/v1/dashboard/pie
app.get("/pie")

// route /api/v1/dashboard/bar
app.get("/bar")

// route /api/v1/dashboard/line
app.get("/line")


export default app