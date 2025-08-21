import express from "express";
import { signup, login, updateProfile } from "../controllers/user.controllers.js";
import protectRoute from "../middleware/user.auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/verify", protectRoute, (req, res) => {
    res.json({ success: true, user: req.user });
});

export default router;