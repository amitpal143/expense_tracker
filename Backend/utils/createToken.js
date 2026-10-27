import jwt from "jsonwebtoken";
import config from "../config/config.js";

const createToken = (userId) =>
    jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

export default createToken;
