import express from "express";
import cors from "cors";
import config from "./config/config.js";
import connectDB from "./config/db.js";
import userRouter from "./Routes/router.js";
import incomeRouter from "./Routes/incomeroute.js";
import expenseRouter from "./Routes/expenserouter.js";
import dashRouter from "./Routes/dashboardroute.js";
import { securityHeaders, rateLimit } from "./middleware/security.js";


import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Only needed on networks that block MongoDB SRV lookups

if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

const app = express();

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(
    cors({
        origin: (origin, cb) => {
            // allow non-browser tools (no Origin header) and configured origins
            if (!origin || config.CORS_ORIGINS.includes(origin)) return cb(null, true);
            return cb(null, false);
        },
        exposedHeaders: ["Content-Disposition"],
    })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Brute-force protection on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/overview", dashRouter);

app.get("/", (req, res) => res.send("Api Working"));

// 404 for unknown API routes
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Central error handler (e.g. malformed JSON) - never leaks stack traces
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Malformed JSON" });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Request too large" });
    }
    console.error("UNHANDLED ERROR:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
});

export default app;

// Start only after the database is connected
if (process.env.NODE_ENV !== "test") {
    connectDB()
        .then(() => {
            app.listen(config.PORT, () => console.log(`Server started on http://localhost:${config.PORT}`));
        })
        .catch((err) => {
            console.error("MongoDB connection failed:", err.message);
            process.exit(1);
        });
}
