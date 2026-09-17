import user from "../Models/userSchema.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export default async function authMiddleware(req, res, next) {
    const authheader = req.headers.authorization;

    // Token check
    if (!authheader || !authheader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "User not authorized",
        });
    }

    // Bearer ke baad token
    const token = authheader.split(" ")[1];

    try {
        // Token verify
        const payload = jwt.verify(token, config.JWT_SECRET);

        console.log("🔥 PAYLOAD:", payload);

        // User find
        const existinguser = await user.findById(payload.userId);

        if (!existinguser) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // User request me attach
        req.user = existinguser;

        next();

    } catch (error) {
        console.log("🔥 AUTH ERROR:", error);
        console.log("🔥 MESSAGE:", error.message);

        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
}