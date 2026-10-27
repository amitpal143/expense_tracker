import dotenv from "dotenv";

dotenv.config();

const { JWT_SECRET, MONGO_URI } = process.env;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
if (!MONGO_URI) throw new Error("MONGO_URI is not defined");

const config = {
    JWT_SECRET,
    MONGO_URI,
    PORT: Number(process.env.PORT) || 5000,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
};

export default config;
