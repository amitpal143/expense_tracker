import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
}

const config = {
    JWT_SECRET,
    MONGO_URI,
};

export default config;