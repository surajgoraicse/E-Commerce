import express, { Router } from "express"
import { newUser , getAllUsers, getUser , deleteUser} from "../controllers/user.controller.js"

const app  = express.Router()

// route : /api/v1/user/new
app.post("/new", newUser)
app.get("/all", getAllUsers)

//   route : /api/v1/user/dynamicID
app.route("/:id").get(getUser).delete(deleteUser)


export default app