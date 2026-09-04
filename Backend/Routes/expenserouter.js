import express from "express";
import { addexpense,getexpense,updateexpense,deleteexpense,downloadsheet,expenseoverview } from "../controller/expensecontroller.js";
import authMiddleware from "../middleware/middleware.js";


const expenseRouter = express.Router();

expenseRouter.post("/add",authMiddleware,addexpense);
expenseRouter.get("/get",authMiddleware,getexpense);

expenseRouter.put("/update/:id",authMiddleware,updateexpense);
expenseRouter.delete("/delete/:id",authMiddleware,deleteexpense);
expenseRouter.get("/overview",authMiddleware,expenseoverview);
expenseRouter.get("/download",authMiddleware,downloadsheet);


export default expenseRouter;

