import user from "../Models/userSchema.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export default async function authMiddleware(req, res, next) {
    const authheader = req.headers.authorization;

    if (!authheader || !authheader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "User not authorized" });
    }

    const token = authheader.split(" ")[1];

    let payload;
    try {
        payload = jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid token";
        return res.status(401).json({ success: false, message });
    }

    try {
        const existinguser = await user.findById(payload.userId).select("-password");

        if (!existinguser) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Reject tokens issued before the last password change
        if (existinguser.passwordChangedAt && payload.iat < Math.floor(existinguser.passwordChangedAt.getTime() / 1000)) {
            return res.status(401).json({ success: false, message: "Session expired" });
        }

        req.user = existinguser;
        next();
    } catch (error) {
        console.error("AUTH ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
