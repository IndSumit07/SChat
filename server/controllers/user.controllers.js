import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"

// Signup a new user
export const signup = async (req, res) => {
    const { fullname, email, password, bio } = req.body;

    try {
        if (!fullname || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({ success: false, message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullname, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        // exclude password before sending
        const userData = newUser.toObject();
        delete userData.password;

        res.json({ success: true, userData, token, message: "Account created successfully" });
    } catch (error) {
        console.log(error.message);

        res.json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = generateToken(user._id);

        const userData = user.toObject();
        delete userData.password;

        res.json({ success: true, userData, token, message: "Login successful" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullname } = req.body;

        const userId = req.user._id;

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullname }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullname }, { new: true })
        }
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}