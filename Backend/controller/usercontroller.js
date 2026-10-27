import user from "../Models/userSchema.js";
import validator from "validator";
import bcrypt from "bcrypt";
import createToken from "../utils/createToken.js";

const bad = (res, message, status = 400) => res.status(status).json({ success: false, message });
const serverError = (res, where, error) => {
    console.error(`${where} ERROR:`, error.message);
    return res.status(500).json({ success: false, message: "Server error" });
};
const isStr = (v) => typeof v === "string";
const normEmail = (e) => (isStr(e) ? e.trim().toLowerCase() : e);

// ================= REGISTER =================
export async function register(req, res) {
    const { name, password } = req.body || {};
    const email = normEmail(req.body?.email);

    if (!isStr(name) || !name.trim() || !isStr(email) || !email || !isStr(password) || !password) {
        return bad(res, "All fields are required");
    }
    if (name.trim().length > 100) return bad(res, "Name is too long");
    if (!validator.isEmail(email)) return bad(res, "Email is invalid");
    if (password.length < 8) return bad(res, "Password must be at least 8 characters");
    if (password.length > 72) return bad(res, "Password must be at most 72 characters"); // bcrypt limit

    try {
        if (await user.findOne({ email })) return bad(res, "User already exists", 409);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await user.create({ name: name.trim(), email, password: hashedPassword });
        const token = createToken(newUser._id);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        if (error.code === 11000) return bad(res, "User already exists", 409);
        return serverError(res, "REGISTER", error);
    }
}

// ================= LOGIN =================
export async function login(req, res) {
    const { password } = req.body || {};
    const email = normEmail(req.body?.email);

    if (!isStr(email) || !email || !isStr(password) || !password) return bad(res, "Both fields are required");
    if (!validator.isEmail(email)) return bad(res, "Invalid email");

    try {
        const existingUser = await user.findOne({ email });
        if (!existingUser) return bad(res, "Invalid email or password", 401);

        const match = await bcrypt.compare(password, existingUser.password);
        if (!match) return bad(res, "Invalid email or password", 401);

        const token = createToken(existingUser._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: existingUser._id, name: existingUser.name, email: existingUser.email },
        });
    } catch (error) {
        return serverError(res, "LOGIN", error);
    }
}

// ================= GET USER =================
export async function getuser(req, res) {
    try {
        const existingUser = await user.findById(req.user._id).select("name email");
        if (!existingUser) return bad(res, "User not found", 404);
        return res.status(200).json({ success: true, user: existingUser });
    } catch (error) {
        return serverError(res, "GET USER", error);
    }
}

// ================= UPDATE USER =================
export async function userupdate(req, res) {
    const { name } = req.body || {};
    const email = normEmail(req.body?.email);

    if (!isStr(name) || !name.trim() || !isStr(email) || !email) return bad(res, "Name and email are required");
    if (name.trim().length > 100) return bad(res, "Name is too long");
    if (!validator.isEmail(email)) return bad(res, "Invalid email");

    try {
        if (await user.findOne({ email, _id: { $ne: req.user._id } })) {
            return bad(res, "Email is already in use", 409);
        }

        const updatedUser = await user
            .findByIdAndUpdate(req.user._id, { name: name.trim(), email }, { new: true, runValidators: true })
            .select("name email");
        if (!updatedUser) return bad(res, "User not found", 404);

        return res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        if (error.code === 11000) return bad(res, "Email is already in use", 409);
        return serverError(res, "USER UPDATE", error);
    }
}

// ================= UPDATE PASSWORD =================
export async function passwordupdate(req, res) {
    const { currentpassword, newpassword } = req.body || {};

    if (!isStr(currentpassword) || !currentpassword || !isStr(newpassword) || !newpassword) {
        return bad(res, "Current password and new password are required");
    }
    if (newpassword.length < 8) return bad(res, "New password must be at least 8 characters");
    if (newpassword.length > 72) return bad(res, "New password must be at most 72 characters");

    try {
        const existingUser = await user.findById(req.user._id);
        if (!existingUser) return bad(res, "User not found", 404);

        const match = await bcrypt.compare(currentpassword, existingUser.password);
        // 400 (not 401) so the frontend doesn't treat a typo as an expired session
        if (!match) return bad(res, "Current password is incorrect", 400);

        existingUser.password = await bcrypt.hash(newpassword, 10);
        existingUser.passwordChangedAt = new Date();
        await existingUser.save();

        // Old tokens are now invalid; hand back a fresh one for this session
        const token = createToken(existingUser._id);

        return res.status(200).json({ success: true, message: "Password updated successfully", token });
    } catch (error) {
        return serverError(res, "PASSWORD UPDATE", error);
    }
}
