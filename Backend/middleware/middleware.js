import user from "../Models/userSchema.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export default async function authMiddleware(req, res, next) {
    const authheader = req.headers.authorization;

    if (!authheader || !authheader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "user not authorize",
        });
    }

    const token = authheader.split(" ")[1];

    try {
        const payload = jwt.verify(token, config.JWT_SECRET);

        const existinguser = await user.findById(payload.userId);

        if (!existinguser) {
            return res.status(401).json({
                success: false,
                message: "user not found",
            });
        }

        req.user = existinguser;
        next();

    }catch (error) {
    console.log("🔥 AUTH ERROR:", error);
    console.log("🔥 MESSAGE:", error.message);
    
    return res.status(401).json({
        success: false,
        message: error.message
    });
}
}