import express from'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB  from './config/db.js';
import dns from "dns";
import userRouter from './Routes/router.js';

dns.setServers(["1.1.1.1", "1.0.0.1"]);


const app = express();
const port =5000;


//middleware
 app.use(express.json());
 app.use(cors());
 app.use(express.urlencoded({ extended:true}));

app.use((req, res, next) => {
    console.log("🔥 REQUEST:", req.method, req.url);
    next();
});



//DB

connectDB();






//ROUTES

app.use("/api/user",userRouter);

app.get('/', (req, res) => {
    res.send("Api Working - NEW SERVER");
});


app.listen(port,()=>
{
    console.log(`Server Started on http://localhost:${port}`);
})