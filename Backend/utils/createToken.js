import jwt from "jsonwebtoken";
import config from "../config/config.js";

const createToken = (userId) => {
    return jwt.sign(
        { userId },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

export default createToken;