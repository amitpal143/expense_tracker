import express from "express";
import authMiddleware from "../middleware/middleware.js";
import { addincome, deleteincome, downloadsheet, getincome, incomeoverview, updateincome } from "../controller/incomecontroller.js";

const incomeRouter = express.Router();

incomeRouter.post("/addincome",authMiddleware,addincome);
incomeRouter.post("/getincome",authMiddleware,getincome);

incomeRouter.put("/updateincome/:id", authMiddleware, updateincome);
incomeRouter.get("/downloadsheet",authMiddleware,downloadsheet);
incomeRouter.get("/incomeoverview",authMiddleware,incomeoverview);

incomeRouter.delete("/deleteincome/:id",authMiddleware,deleteincome);

export default incomeRouter;