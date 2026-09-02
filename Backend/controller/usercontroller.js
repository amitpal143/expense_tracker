import user from "../Models/userSchema.js";
import validator from "validator";
import bcrypt from "bcrypt";
import createToken from "../utils/createToken.js";

// ================= REGISTER =================

export async function register(req, res) {


    const { name, email, password } = req.body;

    // Check fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    // Check email
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Email is invalid",
        });
    }

    // Check password length
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters",
        });
    }

    try {

        // Check existing user
        const existingUser = await user.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
        });

        // Create JWT
        const token = createToken(newUser._id);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });

    } catch (error) {

        console.error("🔥 REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


// ================= LOGIN =================

export async function login(req, res) {

    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both fields are required",
        });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email",
        });
    }

    try {

        // Find user
        const existingUser = await user.findOne({ email });

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const match = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Create token
        const token = createToken(existingUser._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
            },
        });

    } catch (error) {

        console.error("🔥 LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


// ================= GET USER =================

export async function getuser(req, res) {

    try {

        const existingUser = await user
            .findById(req.user.id)
            .select("name email");

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: existingUser,
        });

    } catch (error) {

        console.error("🔥 GET USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


// ================= UPDATE USER =================

export async function userupdate(req, res) {

    const { name, email } = req.body;

    // Check fields
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required",
        });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email",
        });
    }

    try {

        // Check if email already belongs to another user
        const exists = await user.findOne({
            email,
            _id: { $ne: req.user.id },
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Email is already in use",
            });
        }

        // Update user
        const updatedUser = await user.findByIdAndUpdate(
            req.user.id,
            {
                name,
                email,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("name email");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {

        console.error("🔥 USER UPDATE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


// ================= UPDATE PASSWORD =================

export async function passwordupdate(req, res) {

    const { currentpassword, newpassword } = req.body;

    // Check fields
    if (!currentpassword || !newpassword) {
        return res.status(400).json({
            success: false,
            message: "Current password and new password are required",
        });
    }

    // Check new password length
    if (newpassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 8 characters",
        });
    }

    try {

        // Find user
        const existingUser = await user
            .findById(req.user.id)
            .select("password");

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check current password
        const match = await bcrypt.compare(
            currentpassword,
            existingUser.password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newpassword,
            10
        );

        // Save new password
        existingUser.password = hashedPassword;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {

        console.error("🔥 PASSWORD UPDATE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}