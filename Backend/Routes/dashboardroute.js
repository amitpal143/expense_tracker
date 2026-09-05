import express from 'express';
import authMiddleware from '../middleware/middleware.js';
import { getoverview } from '../controller/dashboard.js';


const dashRouter = express.Router();

dashRouter.get("/overview",authMiddleware,getoverview);


export default dashRouter;