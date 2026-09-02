import express from "express";
import { getuser, login, passwordupdate, register, userupdate } from "../controller/usercontroller.js";
import authMiddleware from "../middleware/middleware.js";

const userRouter = express.Router();

userRouter.post("/register",register);
userRouter.post("/login",login);

userRouter.get("/getuser", authMiddleware,getuser);
userRouter.put("/userupdate", authMiddleware,userupdate);
userRouter.put("/passwordupdate", authMiddleware,passwordupdate);

export default userRouter;