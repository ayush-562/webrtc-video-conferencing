import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

// @route POST /api/users/login
router.route("/login").post(loginUser);

// @route   POST /api/users/register
router.route("/register").post(registerUser);

router.route("/add_to_activity");
router.route("/get_all_activity");

export default router;