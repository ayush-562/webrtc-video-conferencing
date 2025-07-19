import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "node:crypto";
import { User } from "../models/user.model.js";


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User Not Found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid credentials" });
        }

        let token = crypto.randomBytes(20).toString("hex");  // 20bytes = 40 hex chars

        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({ token: token });

    } catch (e) {
        return res
            .status(500)
            .json({ message: `Something went wrong!, ${e.message}` });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: "Name, email and password are required." });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res
            .status(400)
            .json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return res
                .status(httpStatus.FOUND)
                .json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        res
            .status(httpStatus.CREATED)
            .json({ message: "User Registered" });

    } catch (e) {
        res
            .status(500)
            .json({ message: `Something went wrong!, ${e.message}` });
    }

};


export { loginUser, registerUser };